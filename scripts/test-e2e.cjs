const { spawn } = require("node:child_process");
const { createRequire } = require("node:module");
const { resolve } = require("node:path");
const webRequire = createRequire(resolve("apps/web/package.json"));
const base = "http://localhost:" + (process.env.E2E_WEB_PORT || 4100);
const apiPort = process.env.E2E_API_PORT || "4101";
const children = [];
let logs = "";
const env = {
  ...process.env,
  NEXTAUTH_URL: base,
  API_URL: "http://localhost:" + apiPort,
  API_PORT: apiPort,
  E2E_BASE_URL: base,
};
function launch(args, cwd = process.cwd()) {
  const child = spawn(process.execPath, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (data) => {
    logs = (logs + data.toString()).slice(-12000);
  });
  child.stderr.on("data", (data) => {
    logs = (logs + data.toString()).slice(-12000);
  });
  children.push(child);
  return child;
}
(async () => {
  try {
    console.log(
      "Starting isolated web/API servers for browser tests on ports " +
        new URL(base).port +
        "/" +
        apiPort,
    );
    launch(["apps/api/dist/main.js"]);
    launch(
      [webRequire.resolve("next/dist/bin/next"), "start", "--port", new URL(base).port],
      resolve("apps/web"),
    );
    for (let attempt = 0; attempt < 100; attempt++) {
      if (children.some((c) => c.exitCode !== null))
        throw new Error("An isolated server exited. " + logs);
      try {
        const results = await Promise.all([
          fetch(base + "/login"),
          fetch("http://localhost:" + apiPort + "/health/ready"),
        ]);
        if (results.every((r) => r.ok)) break;
      } catch {}
      if (attempt === 99) throw new Error("Isolated servers did not become ready. " + logs);
      await new Promise((r) => setTimeout(r, 200));
    }
    const tests = spawn(process.execPath, ["tests/e2e/run.cjs"], { env, stdio: "inherit" });
    const code = await new Promise((resolveCode) => tests.on("exit", resolveCode));
    if (code !== 0) throw new Error("Browser tests failed with exit code " + code);
  } finally {
    for (const child of children) child.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
