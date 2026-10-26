import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
} from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { resolveTxt } from "node:dns/promises";
import { DatabaseService } from "./database.service";
import { SessionGuard, AccessService, IdentityRequest } from "./auth";
import { InstitutionDto, DomainDto, InviteDto, AcceptInviteDto } from "./dto";
@Controller()
@UseGuards(SessionGuard)
export class PlatformController {
  constructor(
    private readonly db: DatabaseService,
    private readonly access: AccessService,
  ) {}
  @Get("me")
  async me(@Req() req: IdentityRequest) {
    return this.db.client.user.findUnique({
      where: { id: req.identity.userId },
      select: {
        id: true,
        name: true,
        email: true,
        memberships: { where: { active: true }, include: { institution: true } },
      },
    });
  }
  @Post("institutions")
  async create(@Req() req: IdentityRequest, @Body() dto: InstitutionDto) {
    return this.db.client.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: dto.name.trim(),
          slug: dto.slug,
          memberships: { create: { userId: req.identity.userId, role: "ADMIN" } },
        },
      });
      await tx.auditEvent.create({
        data: {
          institutionId: institution.id,
          actorId: req.identity.userId,
          action: "institution.created",
          entityId: institution.id,
        },
      });
      return institution;
    });
  }
  @Post("invitations/accept")
  async accept(@Req() req: IdentityRequest, @Body() dto: AcceptInviteDto) {
    const hash = createHash("sha256").update(dto.token).digest("hex");
    return this.db.client.$transaction(async (tx) => {
      const invitation = await tx.invitation.findUnique({ where: { tokenHash: hash } });
      if (
        !invitation ||
        invitation.email !== req.identity.email ||
        invitation.acceptedAt ||
        invitation.expiresAt <= new Date()
      )
        throw new BadRequestException(
          "La invitación es inválida, ya fue usada o pertenece a otro correo.",
        );
      const claimed = await tx.invitation.updateMany({
        where: { id: invitation.id, acceptedAt: null, expiresAt: { gt: new Date() } },
        data: { acceptedAt: new Date() },
      });
      if (claimed.count !== 1) throw new BadRequestException("La invitación ya fue usada.");
      const existing = await tx.membership.findUnique({
        where: {
          userId_institutionId: {
            userId: req.identity.userId,
            institutionId: invitation.institutionId,
          },
        },
      });
      if (existing && !existing.active)
        throw new BadRequestException("La membresía está suspendida. Contacta a la institución.");
      // An invitation cannot silently overwrite an existing role.
      const membership =
        existing ??
        (await tx.membership.create({
          data: {
            userId: req.identity.userId,
            institutionId: invitation.institutionId,
            role: invitation.role,
          },
        }));
      if (membership.role === "STUDENT")
        await tx.student.updateMany({
          where: {
            institutionId: invitation.institutionId,
            email: req.identity.email,
            userId: null,
          },
          data: { userId: req.identity.userId },
        });
      await tx.auditEvent.create({
        data: {
          institutionId: invitation.institutionId,
          actorId: req.identity.userId,
          action: "invitation.accepted",
          entityId: invitation.id,
        },
      });
      return membership;
    });
  }
  @Get("institutions/:institutionId/settings")
  async settings(@Req() req: IdentityRequest, @Param("institutionId", ParseUUIDPipe) id: string) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    return this.db.client.institution.findUnique({
      where: { id },
      include: {
        domains: true,
        memberships: { include: { user: { select: { id: true, name: true, email: true } } } },
        invitations: {
          select: { id: true, email: true, role: true, expiresAt: true, acceptedAt: true },
        },
      },
    });
  }
  @Post("institutions/:institutionId/domains")
  async addDomain(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: DomainDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    const challenge = "educontrol360=" + randomBytes(24).toString("hex");
    const domain = await this.db.client.institutionDomain.create({
      data: { institutionId: id, domain: dto.domain.toLowerCase(), challenge },
    });
    return { ...domain, dnsName: "_educontrol360." + domain.domain, dnsType: "TXT" };
  }
  @Post("institutions/:institutionId/domains/:domainId/verify")
  async verifyDomain(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Param("domainId", ParseUUIDPipe) domainId: string,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    const domain = await this.db.client.institutionDomain.findFirst({
      where: { id: domainId, institutionId: id },
    });
    if (!domain) throw new NotFoundException();
    let records: string[][];
    try {
      records = await resolveTxt("_educontrol360." + domain.domain);
    } catch {
      throw new BadRequestException(
        "No se encontró el registro TXT. Revisa el DNS y espera su propagación.",
      );
    }
    if (!records.some((parts) => parts.join("") === domain.challenge))
      throw new BadRequestException("El registro TXT no coincide con el desafío.");
    return this.db.client.institutionDomain.update({
      where: { id: domainId },
      data: { verifiedAt: new Date() },
    });
  }
  @Post("institutions/:institutionId/invitations")
  async invite(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: InviteDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    if (
      !(await this.db.client.institutionDomain.findFirst({
        where: { institutionId: id, verifiedAt: { not: null } },
      }))
    )
      throw new BadRequestException("Verifica primero un dominio institucional.");
    const token = randomBytes(32).toString("hex");
    const invitation = await this.db.client.invitation.create({
      data: {
        institutionId: id,
        email: dto.email.toLowerCase(),
        role: dto.role,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    return { id: invitation.id, token, expiresAt: invitation.expiresAt };
  }
}
