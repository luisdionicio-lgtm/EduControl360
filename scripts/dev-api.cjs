const { spawn } = require("node:child_process");
const { watch } = require("node:fs");
const { resolve } = require("node:path");
const root = resolve(__dirname, "..");
let server,
  compiler,
  busy = false,
  again = false,
  timer;
function compile() {
  if (busy) {
    again = true;
    return;
  }
  busy = true;
  compiler = spawn(
    process.execPath,
    [
      resolve(root, "node_modules/typescript/bin/tsc"),
      "-p",
      resolve(root, "apps/api/tsconfig.json"),
    ],
    { cwd: root, stdio: "inherit" },
  );
  compiler.on("exit", (code) => {
    busy = false;
    if (code === 0) {
      if (server) server.kill();
      server = spawn(process.execPath, ["--env-file-if-exists=.env", "apps/api/dist/main.js"], {
        cwd: root,
        stdio: "inherit",
      });
    }
    if (again) {
      again = false;
      compile();
    }
  });
}
watch(resolve(root, "apps/api/src"), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(compile, 200);
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    compiler?.kill();
    server?.kill();
    process.exit(0);
  });
compile();
