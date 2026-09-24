import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { dump as yamlDump } from 'js-yaml';

const DOCS_PATH = 'docs';

/** Swagger UI + OpenAPI JSON/YAML routes protected in production. */
const SWAGGER_PROTECTED_PATHS = [
  `/${DOCS_PATH}`,
  `/${DOCS_PATH}-json`,
  `/${DOCS_PATH}-yaml`,
  '/yaml',
  '/ymal',
  '/api/yaml',
  '/api/ymal',
  '/api/docs-json',
];

function applySwaggerBasicAuth(
  app: INestApplication,
  config: ConfigService,
): void {
  const user = config.get<string>('swagger.user');
  const password = config.get<string>('swagger.password');

  if (!user?.trim() || !password?.trim()) {
    throw new Error(
      'SWAGGER_USER and SWAGGER_PASSWORD must be set when NODE_ENV=production',
    );
  }

  app.use(
    SWAGGER_PROTECTED_PATHS,
    basicAuth({
      users: { [user]: password },
      challenge: true,
      realm: 'Fitout API Docs',
    }),
  );
}

function mountYamlEndpoints(
  app: INestApplication,
  openApiYaml: string,
): void {
  const expressApp = app.getHttpAdapter().getInstance() as Express;

  const sendYaml = (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="openapi.yaml"');
    res.send(openApiYaml);
  };

  // Root (main) + under API prefix — include /ymal typo alias
  expressApp.get(['/yaml', '/ymal'], sendYaml);
  expressApp.get(['/api/yaml', '/api/ymal'], sendYaml);
}

/**
 * Sets up Swagger UI at /docs, OpenAPI YAML at /yaml|/ymal and /api/yaml|/api/ymal.
 * In production (NODE_ENV=production), docs are protected with HTTP Basic Auth
 * using SWAGGER_USER / SWAGGER_PASSWORD.
 */
export function setupSwagger(
  app: INestApplication,
  config: ConfigService,
): void {
  const nodeEnv = config.get<string>('app.nodeEnv') ?? 'development';
  const isProduction = nodeEnv === 'production';
  const version = config.get<string>('app.version') ?? '0.0.1';
  const apiPrefix = config.get<string>('app.apiPrefix') ?? 'api';

  if (isProduction) {
    applySwaggerBasicAuth(app, config);
  }

  const documentConfig = new DocumentBuilder()
    .setTitle('Fitout API')
    .setDescription(
      'Interior Design & Fit-Out platform API (shared by client and dashboard).',
    )
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .addServer(`/${apiPrefix}`, 'API prefix')
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup(DOCS_PATH, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Fitout API Docs',
    jsonDocumentUrl: `${DOCS_PATH}-json`,
    yamlDocumentUrl: `${DOCS_PATH}-yaml`,
  });

  const openApiYaml = yamlDump(document, { noRefs: true });
  mountYamlEndpoints(app, openApiYaml);
}
