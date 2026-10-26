import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { verify, JwtPayload } from "jsonwebtoken";
import type { Request } from "express";
import { DatabaseService } from "./database.service";
export interface IdentityRequest extends Request {
  identity: { userId: string; email: string; sessionId: string };
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly database: DatabaseService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<IdentityRequest>();
    try {
      const secret = process.env.API_SESSION_SECRET;
      if (!secret || secret.length < 32) throw new Error("Session secret unavailable");
      const bearer = req.headers.authorization;
      if (!bearer?.startsWith("Bearer ")) throw new Error("Missing bearer");
      const claims = verify(bearer.slice(7), secret, {
        algorithms: ["HS256"],
        issuer: "educontrol-web",
        audience: "educontrol-api",
        maxAge: "90s",
      }) as JwtPayload;
      if (typeof claims.sub !== "string" || typeof claims.sid !== "string")
        throw new Error("Invalid subject");
      const session = await this.database.client.authSession.findUnique({
        where: { id: claims.sid },
        include: { user: true },
      });
      if (
        !session ||
        session.userId !== claims.sub ||
        session.revokedAt ||
        session.expiresAt <= new Date() ||
        !session.user.active
      )
        throw new Error("Inactive session");
      req.identity = { userId: session.userId, email: session.user.email, sessionId: session.id };
      return true;
    } catch {
      throw new UnauthorizedException("La sesión no es válida. Inicia sesión nuevamente.");
    }
  }
}
@Injectable()
export class AccessService {
  constructor(private readonly database: DatabaseService) {}
  async member(userId: string, institutionId: string, roles?: string[]) {
    const member = await this.database.client.membership.findUnique({
      where: { userId_institutionId: { userId, institutionId } },
    });
    if (!member?.active || (roles && !roles.includes(member.role)))
      throw new ForbiddenException(
        "No tienes permiso para realizar esta acción en la institución.",
      );
    return member;
  }
}
