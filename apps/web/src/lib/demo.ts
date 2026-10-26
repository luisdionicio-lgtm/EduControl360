export const demoRoles = ["STUDENT", "TEACHER", "ADMIN"] as const;
export type DemoRole = (typeof demoRoles)[number];
export function isDemoEnabled() {
  try {
    return (
      process.env.APP_ENV === "demo" &&
      process.env.DEMO_MODE === "true" &&
      /^[a-z0-9-]{3,40}$/.test(process.env.DEMO_INSTANCE_ID ?? "") &&
      ["localhost", "127.0.0.1", "[::1]"].includes(new URL(process.env.NEXTAUTH_URL ?? "").hostname)
    );
  } catch {
    return false;
  }
}
export function demoSubject(role: DemoRole) {
  return "demo:" + process.env.DEMO_INSTANCE_ID + ":" + role;
}
