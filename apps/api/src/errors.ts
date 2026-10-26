import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Prisma } from "@edu/database";
import type { Response } from "express";
@Catch(Prisma.PrismaClientKnownRequestError)
export class DatabaseErrorFilter implements ExceptionFilter {
  catch(error: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const status = error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 400;
    const message =
      status === 409
        ? "Ya existe un registro con estos datos."
        : status === 404
          ? "Registro no encontrado."
          : "No se pudo guardar el registro. Revisa los datos.";
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, message });
  }
}
