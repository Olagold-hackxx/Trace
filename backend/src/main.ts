import { Logger, ValidationPipe, VersioningType, RequestMethod } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "https://trace-nu-dusky.vercel.app,http://localhost:3001")
    .split(",")
    .map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true
  });
  // HTTP request logger
  const httpLogger = new Logger("HTTP");
  app.use((req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    const { method, originalUrl } = req;
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      httpLogger.log(`${method} ${originalUrl} ${res.statusCode} +${ms}ms`);
    });
    next();
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1"
  });
  app.setGlobalPrefix("api", {
    exclude: [
      { path: "health", method: RequestMethod.GET },
      { path: "webhooks/squad", method: RequestMethod.POST }
    ]
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
