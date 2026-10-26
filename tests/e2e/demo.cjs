const { chromium } = require("@playwright/test");
const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const { mkdir } = require("node:fs/promises");
const assert = require("node:assert/strict");
const webRequire = createRequire(resolve("apps/web/package.json"));
const { createDatabase } = webRequire("@edu/database");
if (!process.env.DEMO_DB_PASSWORD) throw new Error("Load .env.demo before the Docker demo test.");
const base = "http://localhost:3010";
const db = createDatabase(
  "postgresql://demo:" + process.env.DEMO_DB_PASSWORD + "@localhost:54339/educontrol_demo",
);
(async () => {
  let browser, originalGrade, programName;
  try {
    browser = await chromium.launch({
      channel: process.env.E2E_BROWSER_CHANNEL || "chrome",
      headless: true,
    });
    const dir = resolve(".impeccable/review");
    await mkdir(dir, { recursive: true });
    const errors = [];
    async function openRole(role) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1050 },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(base + "/demo");
      await page.getByRole("button", { name: new RegExp(role) }).click();
      await page.waitForURL(/\/(campus|manage)/);
      await page
        .getByLabel("Institución", { exact: true })
        .selectOption({ label: "Instituto Horizonte" });
      await page.getByRole("button", { name: "Cambiar institución", exact: false }).click();
      await page.waitForLoadState("networkidle");
      return { context, page };
    }
    const entry = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    await entry.goto(base + "/demo");
    await entry.getByRole("heading", { name: /Un campus/ }).waitFor();
    await entry.evaluate(() => document.fonts.ready);
    await entry.screenshot({ path: resolve(dir, "atelier-demo-entry.png"), fullPage: true });
    const { context: studentContext, page: student } = await openRole("Estudiante");
    await student.getByRole("heading", { name: /^Hola, Lucía/ }).waitFor();
    assert.equal(await student.locator(".course-card").count(), 3);
    assert.equal(
      await student.evaluate(
        () =>
          getComputedStyle(document.body).backgroundColor === "rgb(238, 243, 252)" ||
          getComputedStyle(document.documentElement).backgroundColor === "rgb(238, 243, 252)",
      ),
      true,
    );
    assert.ok(
      await student
        .locator("h1")
        .evaluate((el) => getComputedStyle(el).fontFamily.includes("Sora")),
    );
    const cookies = await studentContext.cookies();
    assert.ok(cookies.some((c) => c.name === "educontrol.demo.session-token"));
    assert.ok(!cookies.some((c) => c.name === "next-auth.session-token"));
    await student.getByRole("button", { name: /^Mar \d/ }).click();
    await student
      .locator(".agenda-classes")
      .getByRole("heading", { name: "Diseño de interfaces", exact: true })
      .waitFor();
    assert.equal(
      await student.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await student.screenshot({ path: resolve(dir, "atelier-desktop.png"), fullPage: true });
    const institution = await db.institution.findUniqueOrThrow({
      where: { slug: "demo-atelier-local" },
    });
    const suffix = "?institution=" + institution.id;
    await student.locator(".rail").getByRole("link", { name: "Mis cursos", exact: true }).click();
    await student.getByRole("heading", { name: "Cursos matriculados", exact: true }).waitFor();
    await student.goto(base + "/campus/grades" + suffix);
    await student
      .getByRole("heading", { name: "Calificaciones publicadas", exact: true })
      .waitFor();
    const rejected = await student.request.post(
      base + "/api/backend/institutions/" + institution.id + "/programs",
      { headers: { Origin: base }, data: { name: "Unauthorized demo write" } },
    );
    assert.equal(rejected.status(), 403);
    const { page: teacher } = await openRole("Docente");
    await teacher.getByRole("button", { name: "Evaluaciones y notas", exact: true }).click();
    const enrollment = await db.enrollment.findFirstOrThrow({
      where: {
        student: { user: { googleSub: "demo:atelier-local:STUDENT" } },
        section: { institutionId: institution.id, course: { code: "ARQ-301" } },
      },
    });
    const evaluation = await db.evaluation.findFirstOrThrow({
      where: { sectionId: enrollment.sectionId, name: "Proyecto de arquitectura" },
    });
    originalGrade = await db.grade.findUniqueOrThrow({
      where: {
        enrollmentId_evaluationId: { enrollmentId: enrollment.id, evaluationId: evaluation.id },
      },
    });
    const gradeForm = teacher.locator("section.panel").filter({
      has: teacher.getByRole("heading", { name: "Registrar calificación", exact: true }),
    });
    await gradeForm.getByLabel("Matrícula", { exact: true }).selectOption(enrollment.id);
    await gradeForm.getByLabel("Evaluación", { exact: true }).selectOption(evaluation.id);
    await gradeForm.getByLabel("Nota (0–20)", { exact: true }).fill("18.75");
    await gradeForm.getByLabel("Publicar nota en el portal estudiante", { exact: true }).check();
    await gradeForm.getByRole("button", { name: "Guardar calificación" }).click();
    await gradeForm.getByRole("status").waitFor();
    assert.match(await gradeForm.getByRole("status").innerText(), /Guardado correctamente/);
    await student.goto(base + "/campus/grades" + suffix);
    await student.getByText("18.75", { exact: true }).waitFor();
    await teacher.screenshot({ path: resolve(dir, "atelier-teacher.png"), fullPage: true });
    const { page: admin } = await openRole("Administradora");
    await admin.getByRole("heading", { name: "Gestión académica", exact: true }).waitFor();
    await admin.getByRole("button", { name: "Estructura académica", exact: true }).click();
    programName = "Programa de prueba UI " + Date.now();
    const programForm = admin
      .locator("section.panel")
      .filter({ has: admin.getByRole("heading", { name: "Crear programa", exact: true }) });
    await programForm.getByLabel("Nombre del programa").fill(programName);
    await programForm.getByRole("button", { name: "Crear programa", exact: true }).click();
    await programForm.getByRole("status").waitFor();
    assert.match(await programForm.getByRole("status").innerText(), /Guardado correctamente/);
    assert.ok(
      await db.program.findUnique({
        where: { institutionId_name: { institutionId: institution.id, name: programName } },
      }),
    );
    await admin.screenshot({ path: resolve(dir, "atelier-admin.png"), fullPage: true });
    await db.grade.update({
      where: { id: originalGrade.id },
      data: { score: originalGrade.score, publishedAt: originalGrade.publishedAt },
    });
    await student.goto(base + "/campus" + suffix);
    await student.getByRole("heading", { name: /^Hola, Lucía/ }).waitFor();
    await student.setViewportSize({ width: 390, height: 844 });
    await student.evaluate(() => document.fonts.ready);
    assert.equal(
      await student.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await student.screenshot({ path: resolve(dir, "atelier-mobile.png"), fullPage: true });
    await student.locator(".mobile-navigation summary").click();
    await student
      .locator(".mobile-navigation")
      .getByRole("link", { name: "Mis notas", exact: true })
      .click();
    await student
      .getByRole("heading", { name: "Calificaciones publicadas", exact: true })
      .waitFor();
    assert.equal(
      await student.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await student.screenshot({ path: resolve(dir, "atelier-grades-mobile.png"), fullPage: true });
    await student.setViewportSize({ width: 1440, height: 1050 });
    await student.goto(base + "/campus" + suffix);
    await student
      .getByLabel("Institución", { exact: true })
      .selectOption({ label: "Academia Prisma" });
    await student.getByRole("button", { name: "Cambiar institución", exact: false }).click();
    await student.waitForLoadState("networkidle");
    assert.equal(await student.locator(".course-card").count(), 2);
    const csrf = await admin.request.post(
      base + "/api/backend/institutions/" + institution.id + "/programs",
      { headers: { Origin: "https://untrusted.invalid" }, data: { name: "Forbidden" } },
    );
    assert.equal(csrf.status(), 403);
    await student.locator(".rail").getByRole("button", { name: "Cerrar sesión" }).click();
    await student.waitForURL(/\/login/);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: explicit local demo login for three roles; isolated cookie; PostgreSQL program creation; teacher publication visible to student; student write denied; CSRF denied; calendar day filter; mobile navigation; institution switch; logout. Original grade restored, test-only program removed.",
    );
  } finally {
    await browser?.close();
    if (originalGrade)
      await db.grade.update({
        where: { id: originalGrade.id },
        data: { score: originalGrade.score, publishedAt: originalGrade.publishedAt },
      });
    if (programName)
      await db.program.deleteMany({
        where: { name: programName, institution: { slug: "demo-atelier-local" } },
      });
    await db.$disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
