import { test } from "node:test";
import assert from "node:assert/strict";
import { isDemoEnabled, demoSubject } from "../../apps/web/src/lib/demo.ts";
test("demo access requires explicit demo environment, flag, instance and localhost", () => {
  const keys = ["APP_ENV", "DEMO_MODE", "DEMO_INSTANCE_ID", "NEXTAUTH_URL"] as const;
  const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  try {
    Object.assign(process.env, {
      APP_ENV: "demo",
      DEMO_MODE: "true",
      DEMO_INSTANCE_ID: "atelier-test",
      NEXTAUTH_URL: "http://localhost:3010",
    });
    assert.equal(isDemoEnabled(), true);
    assert.equal(demoSubject("STUDENT"), "demo:atelier-test:STUDENT");
    process.env.APP_ENV = "production";
    assert.equal(isDemoEnabled(), false);
    process.env.APP_ENV = "demo";
    process.env.DEMO_MODE = "false";
    assert.equal(isDemoEnabled(), false);
    process.env.DEMO_MODE = "true";
    process.env.NEXTAUTH_URL = "https://educontrol.example.com";
    assert.equal(isDemoEnabled(), false);
    process.env.NEXTAUTH_URL = "not-a-url";
    assert.equal(isDemoEnabled(), false);
    process.env.NEXTAUTH_URL = "http://localhost:3010";
    process.env.DEMO_INSTANCE_ID = "../anything";
    assert.equal(isDemoEnabled(), false);
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});
