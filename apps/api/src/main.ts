import "reflect-metadata";
import {
  Controller,
  Get,
  Module,
  Injectable,
  ServiceUnavailableException,
  ValidationPipe,
} from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { DatabaseService } from "./database.service";
import { SessionGuard, AccessService } from "./auth";
import { PlatformController } from "./platform.controller";
import { AcademicController } from "./academic.controller";
import { DatabaseErrorFilter } from "./errors";
import { NestFactory } from "@nestjs/core";
import { createDatabase } from "@edu/database";
import { createClient } from "redis";
import helmet from "helmet";

@Injectable()
export class HealthService {
  async readiness() {
    const database = createDatabase();
    const redis = createClient({
      url: process.env.REDIS_URL,
      socket: { connectTimeout: 3000, reconnectStrategy: false },
    });
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
  @Get("live") live() {
    return { status: "ok", service: "educontrol360-api" };
  }
  @Get("ready") ready() {
    return this.health.readiness();
  }
}
@Module({
  controllers: [HealthController, PlatformController, AcademicController],
  providers: [HealthService, DatabaseService, SessionGuard, AccessService],
})
class AppModule {}
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new DatabaseErrorFilter());
  if (process.env.NODE_ENV !== "production") {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("EduControl 360 API")
        .setVersion("0.1.0")
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup("docs", app, document);
  }
  app.enableShutdownHooks();
  await app.listen(Number(process.env.API_PORT ?? 4000), process.env.API_HOST ?? "127.0.0.1");
}
if (require.main === module) void bootstrap();
