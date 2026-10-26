import "reflect-metadata";
import { Controller, Get, Module, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { createDatabase } from "@edu/database";
import { createClient } from "redis";
import helmet from "helmet";

@Injectable()
export class HealthService {
  async readiness() {
    const database = createDatabase();
    const redis = createClient({ url: process.env.REDIS_URL, socket: { connectTimeout: 3000, reconnectStrategy: false } });
    redis.on("error", () => {});
    try {
      await database.$queryRaw`SELECT 1`;
      await redis.connect();
      await redis.ping();
      return { status: "ready", services: { postgres: "up", redis: "up" } };
    } catch {
      throw new ServiceUnavailableException("PostgreSQL or Redis is unavailable");
    } finally {
      await database.$disconnect();
      if (redis.isOpen) await redis.quit();
    }
  }
}
@Controller("health")
class HealthController {
  constructor(private readonly health: HealthService) {}
  @Get("live") live() { return { status: "ok", service: "educontrol360-api" }; }
  @Get("ready") ready() { return this.health.readiness(); }
}
@Module({ controllers: [HealthController], providers: [HealthService] })
class AppModule {}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 4000), "127.0.0.1");
}
if (require.main === module) void bootstrap();

