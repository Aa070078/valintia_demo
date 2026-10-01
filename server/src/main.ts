import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupSwagger } from './infrastructure/swagger/setup-swagger.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 5000;
  const apiPrefix = config.get<string>('app.apiPrefix') ?? 'api';
  const allowedOrigins = config.get<string[]>('app.allowedOrigins') ?? [];
  const nodeEnv = config.get<string>('app.nodeEnv') ?? 'development';

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  setupSwagger(app, config);

  await app.listen(port);

  const base = `http://localhost:${port}`;

  logger.log(`Server listening on ${base}/${apiPrefix}`);
  logger.log(
    `Swagger UI at ${base}/docs${nodeEnv === 'production' ? ' (Basic Auth)' : ''}`,
  );
  logger.log(`OpenAPI YAML at ${base}/yaml and ${base}/${apiPrefix}/yaml`);
}

void bootstrap();
