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
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { SessionGuard, AccessService, IdentityRequest } from "./auth";
import {
  NameDto,
  CourseDto,
  StudentDto,
  PeriodDto,
  SectionDto,
  TeacherDto,
  EnrollmentDto,
  EvaluationDto,
  GradeDto,
  AttendanceDto,
  ScheduleDto,
} from "./dto";
@Controller("institutions/:institutionId")
@UseGuards(SessionGuard)
export class AcademicController {
  constructor(
    private readonly db: DatabaseService,
    private readonly access: AccessService,
  ) {}
  private async section(userId: string, id: string, sectionId: string) {
    const member = await this.access.member(userId, id, ["ADMIN", "TEACHER"]);
    const section = await this.db.client.section.findFirst({
      where: { id: sectionId, institutionId: id },
    });
    if (!section) throw new NotFoundException("Sección no encontrada.");
    if (member.role === "TEACHER" && section.teacherId !== userId)
      throw new ForbiddenException("Esta sección no está asignada a tu cuenta.");
    return section;
  }
  @Get("student")
  async student(@Req() req: IdentityRequest, @Param("institutionId", ParseUUIDPipe) id: string) {
    await this.access.member(req.identity.userId, id);
    const student = await this.db.client.student.findFirst({
      where: { institutionId: id, userId: req.identity.userId },
      include: {
        enrollments: {
          include: {
            section: {
              include: {
                course: true,
                period: true,
                schedules: true,
                evaluations: { select: { id: true, name: true, weight: true, dueAt: true } },
              },
            },
            grades: { where: { publishedAt: { not: null } }, include: { evaluation: true } },
            attendance: true,
          },
        },
      },
    });
    return { student };
  }
  @Get("academic")
  async academic(@Req() req: IdentityRequest, @Param("institutionId", ParseUUIDPipe) id: string) {
    const member = await this.access.member(req.identity.userId, id, ["ADMIN", "TEACHER"]);
    const scope = {
      institutionId: id,
      ...(member.role === "TEACHER" ? { teacherId: req.identity.userId } : {}),
    };
    return {
      programs:
        member.role === "ADMIN"
          ? await this.db.client.program.findMany({
              where: { institutionId: id },
              include: { courses: true },
            })
          : [],
      students:
        member.role === "ADMIN"
          ? await this.db.client.student.findMany({
              where: { institutionId: id },
              orderBy: { name: "asc" },
            })
          : [],
      periods: await this.db.client.period.findMany({ where: { institutionId: id } }),
      teachers:
        member.role === "ADMIN"
          ? await this.db.client.membership.findMany({
              where: { institutionId: id, role: "TEACHER", active: true },
              include: { user: { select: { id: true, name: true, email: true } } },
            })
          : [],
      sections: await this.db.client.section.findMany({
        where: scope,
        include: {
          course: true,
          period: true,
          enrollments: { include: { student: true, grades: true } },
          evaluations: true,
          schedules: true,
        },
      }),
    };
  }
  @Post("programs")
  async program(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: NameDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    return this.db.client.program.create({ data: { institutionId: id, name: dto.name.trim() } });
  }
  @Post("courses")
  async course(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: CourseDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    if (
      !(await this.db.client.program.findFirst({ where: { id: dto.programId, institutionId: id } }))
    )
      throw new NotFoundException("Programa no encontrado.");
    return this.db.client.course.create({
      data: {
        programId: dto.programId,
        name: dto.name.trim(),
        code: dto.code,
        credits: dto.credits,
      },
    });
  }
  @Post("students")
  async createStudent(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: StudentDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    const email = dto.email.toLowerCase();
    const member = await this.db.client.membership.findFirst({
      where: { institutionId: id, active: true, role: "STUDENT", user: { email } },
      select: { userId: true },
    });
    return this.db.client.student.create({
      data: {
        institutionId: id,
        email,
        name: dto.name.trim(),
        code: dto.code,
        userId: member?.userId,
      },
    });
  }
  @Post("periods")
  async period(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: PeriodDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    if (new Date(dto.endsAt) <= new Date(dto.startsAt))
      throw new BadRequestException("La fecha final debe ser posterior a la inicial.");
    return this.db.client.period.create({
      data: {
        institutionId: id,
        name: dto.name,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
      },
    });
  }
  @Post("sections")
  async createSection(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: SectionDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    if (
      !(await this.db.client.course.findFirst({
        where: { id: dto.courseId, program: { institutionId: id } },
      })) ||
      !(await this.db.client.period.findFirst({ where: { id: dto.periodId, institutionId: id } }))
    )
      throw new BadRequestException("Curso o período fuera de la institución.");
    return this.db.client.section.create({ data: { institutionId: id, ...dto } });
  }
  @Post("sections/:sectionId/teacher")
  async teacher(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Param("sectionId", ParseUUIDPipe) sectionId: string,
    @Body() dto: TeacherDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    await this.section(req.identity.userId, id, sectionId);
    await this.access.member(dto.teacherId, id, ["TEACHER"]);
    return this.db.client.section.update({
      where: { id: sectionId },
      data: { teacherId: dto.teacherId },
    });
  }
  @Post("enrollments")
  async enroll(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: EnrollmentDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    await this.section(req.identity.userId, id, dto.sectionId);
    if (
      !(await this.db.client.student.findFirst({ where: { id: dto.studentId, institutionId: id } }))
    )
      throw new NotFoundException("Estudiante no encontrado.");
    return this.db.client.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({ data: dto });
      await tx.auditEvent.create({
        data: {
          institutionId: id,
          actorId: req.identity.userId,
          action: "enrollment.created",
          entityId: enrollment.id,
        },
      });
      return enrollment;
    });
  }
  @Post("evaluations")
  async evaluation(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: EvaluationDto,
  ) {
    await this.section(req.identity.userId, id, dto.sectionId);
    return this.db.client.$transaction(async (tx) => {
      // Serialize weighting changes per section to prevent concurrent totals over 100.
      await tx.$queryRaw`SELECT id FROM "Section" WHERE id = ${dto.sectionId}::uuid FOR UPDATE`;
      const sum = await tx.evaluation.aggregate({
        where: { sectionId: dto.sectionId },
        _sum: { weight: true },
      });
      if ((sum._sum.weight ?? 0) + dto.weight > 100)
        throw new BadRequestException("Los pesos de las evaluaciones no pueden superar el 100 %.");
      return tx.evaluation.create({ data: { ...dto, dueAt: new Date(dto.dueAt) } });
    });
  }
  @Post("grades")
  async grade(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: GradeDto,
  ) {
    const evaluation = await this.db.client.evaluation.findFirst({
      where: { id: dto.evaluationId, section: { institutionId: id } },
    });
    if (!evaluation) throw new NotFoundException("Evaluación no encontrada.");
    await this.section(req.identity.userId, id, evaluation.sectionId);
    if (
      !(await this.db.client.enrollment.findFirst({
        where: { id: dto.enrollmentId, sectionId: evaluation.sectionId },
      }))
    )
      throw new BadRequestException("La matrícula no pertenece a esta evaluación.");
    return this.db.client.$transaction(async (tx) => {
      const data = { score: dto.score, publishedAt: dto.publish ? new Date() : null };
      const grade = await tx.grade.upsert({
        where: {
          enrollmentId_evaluationId: {
            enrollmentId: dto.enrollmentId,
            evaluationId: dto.evaluationId,
          },
        },
        create: { enrollmentId: dto.enrollmentId, evaluationId: dto.evaluationId, ...data },
        update: data,
      });
      await tx.auditEvent.create({
        data: {
          institutionId: id,
          actorId: req.identity.userId,
          action: dto.publish ? "grade.published" : "grade.drafted",
          entityId: grade.id,
        },
      });
      return grade;
    });
  }
  @Post("attendance")
  async attendance(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: AttendanceDto,
  ) {
    const enrollment = await this.db.client.enrollment.findFirst({
      where: { id: dto.enrollmentId, section: { institutionId: id } },
    });
    if (!enrollment) throw new NotFoundException();
    await this.section(req.identity.userId, id, enrollment.sectionId);
    const date = new Date(dto.date + "T00:00:00Z");
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dto.date)
      throw new BadRequestException("Fecha inválida.");
    return this.db.client.attendance.upsert({
      where: { enrollmentId_date: { enrollmentId: enrollment.id, date } },
      create: { enrollmentId: enrollment.id, date, status: dto.status },
      update: { status: dto.status },
    });
  }
  @Post("schedules")
  async schedule(
    @Req() req: IdentityRequest,
    @Param("institutionId", ParseUUIDPipe) id: string,
    @Body() dto: ScheduleDto,
  ) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    await this.section(req.identity.userId, id, dto.sectionId);
    if (dto.endTime <= dto.startTime)
      throw new BadRequestException("La hora final debe ser posterior a la inicial.");
    return this.db.client.schedule.create({ data: dto });
  }
  @Get("audit")
  async audit(@Req() req: IdentityRequest, @Param("institutionId", ParseUUIDPipe) id: string) {
    await this.access.member(req.identity.userId, id, ["ADMIN"]);
    return this.db.client.auditEvent.findMany({
      where: { institutionId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
