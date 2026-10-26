const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const { sign } = require("jsonwebtoken");
const { createDatabase } = require("@edu/database");

test("real academic flow, authorization and tenant isolation", { timeout: 60000 }, async (t) => {
  assert.ok(
    process.env.DATABASE_URL,
    "Start PostgreSQL and configure DATABASE_URL before running integration tests",
  );
  const db = createDatabase();
  const tag = randomUUID().slice(0, 8);
  const userIds = [];
  const institutionIds = [];
  const secret = process.env.API_SESSION_SECRET || "integration-test-secret-at-least-32-characters";
  const port = process.env.TEST_API_PORT || "4010";
  const base = "http://127.0.0.1:" + port;
  const server = spawn(process.execPath, ["dist/main.js"], {
    env: { ...process.env, API_PORT: port, API_SESSION_SECRET: secret },
    stdio: "pipe",
  });
  let output = "";
  server.stderr.on("data", (chunk) => (output += chunk));
  server.stdout.on("data", (chunk) => (output += chunk));
  async function actor(label) {
    const user = await db.user.create({
      data: {
        googleSub: "test-only:" + tag + ":" + label,
        email: tag + "-" + label + "@example.invalid",
        name: "Prueba " + label,
      },
    });
    userIds.push(user.id);
    const session = await db.authSession.create({
      data: { userId: user.id, expiresAt: new Date(Date.now() + 3600000) },
    });
    const token = sign({ sid: session.id }, secret, {
      algorithm: "HS256",
      subject: user.id,
      issuer: "educontrol-web",
      audience: "educontrol-api",
      expiresIn: 60,
    });
    return { ...user, token, sessionId: session.id };
  }
  async function call(actor, path, data, expected = 200) {
    const r = await fetch(base + "/" + path, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(actor ? { Authorization: "Bearer " + actor.token } : {}),
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const result = await r.json();
    assert.equal(r.status, expected, JSON.stringify({ path, result }));
    return result;
  }
  try {
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(base + "/health/live")).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
      if (i === 99) throw new Error(output);
    }
    const admin = await actor("admin"),
      student = await actor("student"),
      otherStudent = await actor("other-student"),
      teacher = await actor("teacher"),
      outsider = await actor("outsider");
    let institution, program, course, period, section, enrollment, evaluation, record;
    await t.test("missing and forged sessions are rejected", async () => {
      await call(null, "me", undefined, 401);
      await call({ token: "forged" }, "me", undefined, 401);
      const wrong = sign({ sid: admin.sessionId }, secret, {
        subject: admin.id,
        issuer: "educontrol-web",
        audience: "another-api",
        expiresIn: 60,
      });
      await call({ token: wrong }, "me", undefined, 401);
      const expired = sign({ sid: admin.sessionId }, secret, {
        subject: admin.id,
        issuer: "educontrol-web",
        audience: "educontrol-api",
        expiresIn: -1,
      });
      await call({ token: expired }, "me", undefined, 401);
    });
    await t.test("create institution with explicit owner membership", async () => {
      institution = await call(
        admin,
        "institutions",
        { name: "Institución de pruebas " + tag, slug: "test-" + tag },
        201,
      );
      institutionIds.push(institution.id);
      const foreign = await call(
        outsider,
        "institutions",
        { name: "Otra institución " + tag, slug: "test-other-" + tag },
        201,
      );
      institutionIds.push(foreign.id);
      await db.membership.createMany({
        data: [
          { userId: student.id, institutionId: institution.id, role: "STUDENT" },
          { userId: otherStudent.id, institutionId: institution.id, role: "STUDENT" },
          { userId: teacher.id, institutionId: institution.id, role: "TEACHER" },
        ],
      });
      await call(outsider, "institutions/" + institution.id + "/academic", undefined, 403);
      await call(
        student,
        "institutions/" + institution.id + "/programs",
        { name: "Escalada" },
        403,
      );
    });
    const path = () => "institutions/" + institution.id + "/";
    await t.test("real program, course, period, section and teacher assignment", async () => {
      program = await call(admin, path() + "programs", { name: "Desarrollo de Software" }, 201);
      course = await call(
        admin,
        path() + "courses",
        { programId: program.id, name: "Arquitectura de software", code: "ARQ-301", credits: 4 },
        201,
      );
      period = await call(
        admin,
        path() + "periods",
        { name: "2026-II", startsAt: "2026-08-01T00:00:00Z", endsAt: "2026-12-31T00:00:00Z" },
        201,
      );
      section = await call(
        admin,
        path() + "sections",
        { name: "A", courseId: course.id, periodId: period.id },
        201,
      );
      await call(
        admin,
        path() + "sections/" + section.id + "/teacher",
        { teacherId: teacher.id },
        201,
      );
      record = await call(
        admin,
        path() + "students",
        { name: student.name, email: student.email, code: "S-" + tag.toUpperCase() },
        201,
      );
      enrollment = await call(
        admin,
        path() + "enrollments",
        { studentId: record.id, sectionId: section.id },
        201,
      );
      await call(
        admin,
        path() + "enrollments",
        { studentId: record.id, sectionId: section.id },
        409,
      );
      await call(
        admin,
        path() + "courses",
        { programId: program.id, name: "Inválido", code: "BAD", credits: -1 },
        400,
      );
      await call(
        admin,
        path() + "programs",
        { name: "No válido", institutionId: institution.id },
        400,
      );
    });
    await t.test("teacher assignment is mandatory and weights are serialized", async () => {
      await call(
        outsider,
        path() + "evaluations",
        { sectionId: section.id, name: "Ataque", weight: 30, dueAt: "2026-11-10T00:00:00Z" },
        403,
      );
      evaluation = await call(
        teacher,
        path() + "evaluations",
        {
          sectionId: section.id,
          name: "Proyecto final",
          weight: 60,
          dueAt: "2026-11-10T00:00:00Z",
        },
        201,
      );
      await call(
        teacher,
        path() + "evaluations",
        { sectionId: section.id, name: "Exceso", weight: 60, dueAt: "2026-11-20T00:00:00Z" },
        400,
      );
      const results = await Promise.all(
        [1, 2].map((n) =>
          fetch(base + "/" + path() + "evaluations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + teacher.token,
            },
            body: JSON.stringify({
              sectionId: section.id,
              name: "Concurrente " + n,
              weight: 25,
              dueAt: "2026-11-20T00:00:00Z",
            }),
          }),
        ),
      );
      assert.deepEqual(results.map((r) => r.status).sort(), [201, 400]);
    });
    await t.test("draft hidden, published grade visible only to enrolled student", async () => {
      const body = {
        enrollmentId: enrollment.id,
        evaluationId: evaluation.id,
        score: 18.5,
        publish: false,
      };
      await call(teacher, path() + "grades", body, 201);
      let dashboard = await call(student, path() + "student");
      assert.equal(dashboard.student.enrollments[0].grades.length, 0);
      await call(student, path() + "grades", { ...body, publish: true }, 403);
      await call(teacher, path() + "grades", { ...body, publish: true }, 201);
      dashboard = await call(student, path() + "student");
      assert.equal(Number(dashboard.student.enrollments[0].grades[0].score), 18.5);
      assert.equal((await call(otherStudent, path() + "student")).student, null);
      await call(outsider, path() + "student", undefined, 403);
      const events = await call(admin, path() + "audit");
      assert.ok(events.some((e) => e.action === "grade.published"));
    });
    await t.test("attendance and schedules persist; invalid time rejected", async () => {
      await call(
        teacher,
        path() + "attendance",
        { enrollmentId: enrollment.id, date: "2026-10-26", status: "PRESENT" },
        201,
      );
      await call(
        admin,
        path() + "schedules",
        { sectionId: section.id, weekday: 1, startTime: "09:00", endTime: "11:00", room: "A-204" },
        201,
      );
      await call(
        admin,
        path() + "schedules",
        { sectionId: section.id, weekday: 1, startTime: "12:00", endTime: "11:00", room: "A-204" },
        400,
      );
      const dashboard = await call(student, path() + "student");
      assert.equal(dashboard.student.enrollments[0].attendance[0].status, "PRESENT");
      assert.equal(dashboard.student.enrollments[0].section.schedules[0].room, "A-204");
    });
    await t.test("unverified domains grant no invitations or membership", async () => {
      await call(admin, path() + "invitations", { email: outsider.email, role: "ADMIN" }, 400);
      const domain = await call(admin, path() + "domains", { domain: "example.invalid" }, 201);
      await call(admin, path() + "domains/" + domain.id + "/verify", {}, 400);
      // DNS ownership is simulated only in this isolated integration fixture.
      await db.institutionDomain.update({
        where: { id: domain.id },
        data: { verifiedAt: new Date() },
      });
      const invite = await call(
        admin,
        path() + "invitations",
        { email: outsider.email, role: "STUDENT" },
        201,
      );
      await call(student, "invitations/accept", { token: invite.token }, 400);
      const member = await call(outsider, "invitations/accept", { token: invite.token }, 201);
      assert.equal(member.role, "STUDENT");
      await call(outsider, "invitations/accept", { token: invite.token }, 400);
      await call(outsider, path() + "programs", { name: "Escalada por dominio" }, 403);
    });
    await t.test("membership suspension and session revocation apply immediately", async () => {
      await db.membership.updateMany({
        where: { userId: student.id, institutionId: institution.id },
        data: { active: false },
      });
      await call(student, path() + "student", undefined, 403);
      await db.authSession.update({
        where: { id: admin.sessionId },
        data: { revokedAt: new Date() },
      });
      await call(admin, "me", undefined, 401);
    });
  } finally {
    server.kill();
    for (const id of institutionIds) {
      const filter = { section: { institutionId: id } };
      await db.grade.deleteMany({ where: { enrollment: filter } });
      await db.attendance.deleteMany({ where: { enrollment: filter } });
      await db.enrollment.deleteMany({ where: filter });
      await db.evaluation.deleteMany({ where: { section: { institutionId: id } } });
      await db.schedule.deleteMany({ where: { section: { institutionId: id } } });
      await db.section.deleteMany({ where: { institutionId: id } });
      await db.course.deleteMany({ where: { program: { institutionId: id } } });
      await db.program.deleteMany({ where: { institutionId: id } });
      await db.period.deleteMany({ where: { institutionId: id } });
      await db.student.deleteMany({ where: { institutionId: id } });
      await db.invitation.deleteMany({ where: { institutionId: id } });
      await db.institutionDomain.deleteMany({ where: { institutionId: id } });
      await db.auditEvent.deleteMany({ where: { institutionId: id } });
      await db.membership.deleteMany({ where: { institutionId: id } });
      await db.institution.delete({ where: { id } });
    }
    await db.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.$disconnect();
  }
});
