const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const dbRequire = createRequire(resolve(__dirname, "../apps/api/package.json"));
const { createDatabase } = dbRequire("@edu/database");
if (
  process.env.APP_ENV !== "demo" ||
  process.env.DEMO_MODE !== "true" ||
  !/^[a-z0-9-]{3,40}$/.test(process.env.DEMO_INSTANCE_ID || "")
)
  throw new Error(
    "Demo seeding requires explicit APP_ENV=demo, DEMO_MODE=true and DEMO_INSTANCE_ID.",
  );
const db = createDatabase();
(async () => {
  try {
    const slug = "demo-" + process.env.DEMO_INSTANCE_ID;
    if (await db.institution.findUnique({ where: { slug } })) {
      console.log("Demo already initialized; preserving all existing demo changes.");
      return;
    }
    await db.$transaction(
      async (tx) => {
        const actors = {};
        for (const [role, name] of [
          ["STUDENT", "Lucía Torres"],
          ["TEACHER", "Diego Mendoza"],
          ["ADMIN", "Valeria Ríos"],
        ]) {
          actors[role] = await tx.user.upsert({
            where: { googleSub: "demo:" + process.env.DEMO_INSTANCE_ID + ":" + role },
            create: {
              googleSub: "demo:" + process.env.DEMO_INSTANCE_ID + ":" + role,
              email: role.toLowerCase() + "@" + slug + ".invalid",
              name,
            },
            update: {},
          });
        }
        const catalog = [
          {
            name: "Instituto Horizonte",
            slug,
            program: "Desarrollo de Software",
            courses: [
              ["Arquitectura de software", "ARQ-301", 4],
              ["Diseño de interfaces", "UX-204", 3],
              ["Base de datos avanzada", "BD-302", 4],
            ],
          },
          {
            name: "Academia Prisma",
            slug: slug + "-prisma",
            program: "Especialización digital",
            courses: [
              ["Fundamentos de diseño", "DIS-101", 3],
              ["Desarrollo web", "WEB-102", 4],
            ],
          },
        ];
        for (const [tenantIndex, item] of catalog.entries()) {
          const institution = await tx.institution.create({
            data: { name: item.name, slug: item.slug },
          });
          for (const role of ["STUDENT", "TEACHER", "ADMIN"])
            await tx.membership.create({
              data: { userId: actors[role].id, institutionId: institution.id, role },
            });
          await tx.institutionDomain.create({
            data: {
              institutionId: institution.id,
              domain: item.slug + ".invalid",
              challenge: "DEMO-ONLY-NOT-REAL-DNS",
              verifiedAt: new Date(),
            },
          });
          const program = await tx.program.create({
            data: { institutionId: institution.id, name: item.program },
          });
          const period = await tx.period.create({
            data: {
              institutionId: institution.id,
              name: "2026-II",
              startsAt: new Date("2026-08-03"),
              endsAt: new Date("2026-12-18"),
            },
          });
          const student = await tx.student.create({
            data: {
              institutionId: institution.id,
              userId: actors.STUDENT.id,
              name: actors.STUDENT.name,
              email: actors.STUDENT.email,
              code: tenantIndex ? "PRI-2026-018" : "HOR-2026-024",
            },
          });
          const guest = await tx.student.create({
            data: {
              institutionId: institution.id,
              name: "Mateo Vega · demo",
              email: "mateo@" + item.slug + ".invalid",
              code: "DEMO-MATEO",
            },
          });
          for (const [index, [name, code, credits]] of item.courses.entries()) {
            const course = await tx.course.create({
              data: { programId: program.id, name, code, credits },
            });
            const section = await tx.section.create({
              data: {
                institutionId: institution.id,
                courseId: course.id,
                periodId: period.id,
                name: "Sección A",
                teacherId: actors.TEACHER.id,
              },
            });
            const enrollment = await tx.enrollment.create({
              data: { studentId: student.id, sectionId: section.id },
            });
            await tx.enrollment.create({ data: { studentId: guest.id, sectionId: section.id } });
            const names =
              index === 0
                ? ["Diseño de componentes", "Proyecto de arquitectura", "Presentación final"]
                : index === 1
                  ? [
                      "Investigación de usuarios",
                      "Prototipo interactivo",
                      "Validación de usabilidad",
                    ]
                  : ["Modelado relacional", "Optimización de consultas", "Proyecto de integración"];
            for (let n = 0; n < 3; n++) {
              const evaluation = await tx.evaluation.create({
                data: {
                  sectionId: section.id,
                  name: names[n],
                  weight: [30, 30, 40][n],
                  dueAt: new Date(
                    n === 0
                      ? "2026-10-12T15:00:00Z"
                      : n === 1
                        ? "2026-10-23T15:00:00Z"
                        : "2026-11-06T15:00:00Z",
                  ),
                },
              });
              if (n < 2)
                await tx.grade.create({
                  data: {
                    enrollmentId: enrollment.id,
                    evaluationId: evaluation.id,
                    score: [
                      [18.5, 17.5],
                      [19, 18],
                      [16.5, 18],
                    ][index % 3][n],
                    publishedAt: new Date("2026-10-24T15:00:00Z"),
                  },
                });
            }
            await tx.schedule.createMany({
              data: [
                {
                  sectionId: section.id,
                  weekday: index + 1,
                  startTime: index === 0 ? "09:00" : index === 1 ? "11:00" : "14:00",
                  endTime: index === 0 ? "11:00" : index === 1 ? "13:00" : "16:00",
                  room: ["Lab. A-204", "Estudio B-102", "Lab. C-305"][index % 3],
                },
                {
                  sectionId: section.id,
                  weekday: index + 4,
                  startTime: "09:00",
                  endTime: "11:00",
                  room: ["Lab. A-204", "Estudio B-102", "Lab. C-305"][index % 3],
                },
              ],
            });
            for (let day = 0; day < 8; day++)
              await tx.attendance.create({
                data: {
                  enrollmentId: enrollment.id,
                  date: new Date(Date.UTC(2026, 9, 5 + day * 2)),
                  status:
                    day === 3 && index === 2
                      ? "ABSENT"
                      : day === 5 && index === 1
                        ? "LATE"
                        : "PRESENT",
                },
              });
          }
          await tx.auditEvent.create({
            data: {
              institutionId: institution.id,
              actorId: actors.ADMIN.id,
              action: "demo.initialized",
              entityId: institution.id,
            },
          });
        }
      },
      { timeout: 30000 },
    );
    console.log(
      "Demo initialized: two fictional institutions, three role profiles, courses, grades, attendance and schedules. Google and DNS are not real validations.",
    );
  } finally {
    await db.$disconnect();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
