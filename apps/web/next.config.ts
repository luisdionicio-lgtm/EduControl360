import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@edu/database", "@prisma/client", "@prisma/adapter-pg", "pg"],
};
export default config;
