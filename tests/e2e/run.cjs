const { chromium } = require("@playwright/test");
const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const { mkdir } = require("node:fs/promises");
const assert = require("node:assert/strict");
const webRequire = createRequire(resolve("apps/web/package.json"));
const { createDatabase } = webRequire("@edu/database");
const { encode } = webRequire("next-auth/jwt");
const db = createDatabase();
const base = process.env.E2E_BASE_URL || "http://localhost:3000";
const { randomUUID } = require("node:crypto");
(async () => {
  const tag = randomUUID().slice(0, 8);
  const users = [];
  let institution, browser;
  async function identity(name, role) {
    const user = await db.user.create({
      data: {
        googleSub: "browser-test:" + tag + ":" + role,
        email: tag + "-" + role.toLowerCase() + "@example.invalid",
        name,
      },
    });
    users.push(user.id);
    const session = await db.authSession.create({
      data: { userId: user.id, expiresAt: new Date(Date.now() + 3600000) },
    });
    const token = await encode({
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      token: { uid: user.id, sid: session.id, name: user.name, email: user.email },
      maxAge: 3600,
    });
    return { user, session, token };
  }
  async function contextFor(actor, width = 1440, height = 1000) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await context.addCookies([
      {
        name: "next-auth.session-token",
        value: actor.token,
        url: base,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    return context;
  }
  async function fillForm(page, title, values) {
    const section = page
      .locator("section.panel")
      .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
    for (const [label, value] of Object.entries(values)) {
      const input = section.getByLabel(label, { exact: true });
      if (await input.evaluate((el) => el.tagName === "SELECT"))
        await input.selectOption({ label: value });
      else await input.fill(value);
    }
    await section.getByRole("button").click();
    await section.getByRole("status").waitFor();
    assert.match(await section.getByRole("status").innerText(), /Guardado correctamente/);
  }
  try {
    browser = await chromium.launch({
      channel: process.env.E2E_BROWSER_CHANNEL || "chrome",
      headless: true,
    });
    const student = await identity("Lucía Torres · prueba", "STUDENT"),
      admin = await identity("Administración · prueba", "ADMIN");
    institution = await db.institution.create({
      data: { name: "Instituto Horizonte · demostración", slug: "browser-test-" + tag },
    });
    await db.membership.createMany({
      data: users.map((id) => ({
        userId: id,
        institutionId: institution.id,
        role: id === student.user.id ? "STUDENT" : "ADMIN",
      })),
    });
    const program = await db.program.create({
      data: { institutionId: institution.id, name: "Desarrollo de Software" },
    });
    const course = await db.course.create({
      data: {
        programId: program.id,
        name: "Arquitectura de software",
        code: "ARQ-301",
        credits: 4,
      },
    });
    const period = await db.period.create({
      data: {
        institutionId: institution.id,
        name: "2026-II",
        startsAt: new Date("2026-08-01"),
        endsAt: new Date("2026-12-31"),
      },
    });
    const section = await db.section.create({
      data: {
        institutionId: institution.id,
        courseId: course.id,
        periodId: period.id,
        name: "Sección A",
      },
    });
    const record = await db.student.create({
      data: {
        institutionId: institution.id,
        userId: student.user.id,
        name: student.user.name,
        email: student.user.email,
        code: "DEMO-2026",
      },
    });
    const enrollment = await db.enrollment.create({
      data: { studentId: record.id, sectionId: section.id },
    });
    const evaluation = await db.evaluation.create({
      data: {
        sectionId: section.id,
        name: "Proyecto de arquitectura",
        weight: 60,
        dueAt: new Date("2026-11-10"),
      },
    });
    await db.grade.create({
      data: {
        enrollmentId: enrollment.id,
        evaluationId: evaluation.id,
        score: 18.5,
        publishedAt: new Date("2026-10-26T15:00:00Z"),
      },
    });
    await db.attendance.create({
      data: { enrollmentId: enrollment.id, date: new Date("2026-10-26"), status: "PRESENT" },
    });
    await db.schedule.create({
      data: {
        sectionId: section.id,
        weekday: 1,
        startTime: "09:00",
        endTime: "11:00",
        room: "A-204",
      },
    });
    const dir = resolve(".impeccable/review");
    await mkdir(dir, { recursive: true });
    const errors = [];
    const desktop = await contextFor(student);
    const page = await desktop.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/campus?institution=" + institution.id);
    await page.getByRole("heading", { name: "Tu aprendizaje, en un solo lugar." }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.ok((await page.getByText("18.50", { exact: true }).count()) === 1);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.screenshot({ path: resolve(dir, "desktop.png"), fullPage: true });
    for (const [path, text] of [
      ["courses", "Cursos matriculados"],
      ["grades", "Calificaciones publicadas"],
      ["attendance", "Registro por curso"],
      ["schedule", "Tu semana académica"],
      ["account", "Identidad y acceso"],
    ]) {
      await page.goto(base + "/campus/" + path + "?institution=" + institution.id);
      await page.getByRole("heading", { name: text, exact: true }).waitFor();
    }
    await page.goto(base + "/campus/grades?institution=" + institution.id);
    await page.getByText("18.50", { exact: true }).waitFor();
    await page.goto(base + "/manage?institution=" + institution.id);
    await page.waitForURL(/\/campus/);
    const csrf = await page.request.post(base + "/api/backend/institutions", {
      headers: { Origin: "https://untrusted.invalid" },
      data: { name: "Ataque", slug: "attack-" + tag },
    });
    assert.equal(csrf.status(), 403);
    const mobile = await contextFor(student, 390, 844);
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(base + "/campus?institution=" + institution.id);
    await mobilePage.getByRole("heading", { name: "Tu aprendizaje, en un solo lugar." }).waitFor();
    await mobilePage.evaluate(() => document.fonts.ready);
    assert.equal(
      await mobilePage.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await mobilePage.screenshot({ path: resolve(dir, "mobile.png"), fullPage: true });
    const adminContext = await contextFor(admin);
    const adminPage = await adminContext.newPage();
    await adminPage.goto(base + "/manage?institution=" + institution.id);
    await adminPage.getByRole("heading", { name: "Gestión académica", exact: true }).waitFor();
    await fillForm(adminPage, "Crear programa", {
      "Nombre del programa": "Programa creado desde navegador",
    });
    await adminPage.waitForLoadState("networkidle");
    await adminPage.getByRole("button", { name: "Evaluaciones y notas", exact: true }).click();
    const form = adminPage.locator("section.panel").filter({
      has: adminPage.getByRole("heading", { name: "Registrar calificación", exact: true }),
    });
    await form.getByLabel("Matrícula", { exact: true }).selectOption(enrollment.id);
    await form.getByLabel("Evaluación", { exact: true }).selectOption(evaluation.id);
    await form.getByLabel("Nota (0–20)", { exact: true }).fill("19");
    await form.getByLabel("Publicar nota en el portal estudiante", { exact: true }).check();
    await form.getByRole("button", { name: "Guardar calificación" }).click();
    await form.getByRole("status").waitFor();
    assert.match(await form.getByRole("status").innerText(), /Guardado correctamente/);
    await page.goto(base + "/campus/grades?institution=" + institution.id);
    await page.getByText("19.00", { exact: true }).waitFor();
    await adminPage.screenshot({ path: resolve(dir, "management.png"), fullPage: true });
    await db.authSession.update({
      where: { id: admin.session.id },
      data: { revokedAt: new Date() },
    });
    await adminPage.goto(base + "/campus");
    await adminPage.waitForURL(/\/login/);
    await adminPage.getByRole("heading", { name: "Bienvenido a tu campus" }).waitFor();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.waitForURL(/\/login/);
    const revoked = await db.authSession.findUnique({ where: { id: student.session.id } });
    assert.ok(revoked.revokedAt);
    const anonymous = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const login = await anonymous.newPage();
    await login.goto(base + "/login");
    await login.getByRole("heading", { name: "Bienvenido a tu campus" }).waitFor();
    await login.evaluate(() => document.fonts.ready);
    await login.screenshot({ path: resolve(dir, "login-desktop.png"), fullPage: true });
    await login.setViewportSize({ width: 390, height: 844 });
    await login.screenshot({ path: resolve(dir, "login-mobile.png"), fullPage: true });
    assert.equal(
      await login.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await login.goto(base + "/campus");
    await login.waitForURL(/\/login/);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: desktop/mobile portal, routes, admin mutation, grade publication visible to student, CSRF rejection, student role restriction, logout revocation, anonymous redirect; screenshots captured.",
    );
  } finally {
    await browser?.close();
    if (institution) {
      const id = institution.id,
        scope = { section: { institutionId: id } };
      await db.grade.deleteMany({ where: { enrollment: scope } });
      await db.attendance.deleteMany({ where: { enrollment: scope } });
      await db.enrollment.deleteMany({ where: scope });
      await db.evaluation.deleteMany({ where: { section: { institutionId: id } } });
      await db.schedule.deleteMany({ where: { section: { institutionId: id } } });
      await db.section.deleteMany({ where: { institutionId: id } });
      await db.course.deleteMany({ where: { program: { institutionId: id } } });
      await db.program.deleteMany({ where: { institutionId: id } });
      await db.period.deleteMany({ where: { institutionId: id } });
      await db.student.deleteMany({ where: { institutionId: id } });
      await db.auditEvent.deleteMany({ where: { institutionId: id } });
      await db.membership.deleteMany({ where: { institutionId: id } });
      await db.institution.delete({ where: { id } });
    }
    await db.authSession.deleteMany({ where: { userId: { in: users } } });
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.$disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
