import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function getAllowedCorsOrigins(): string[] {
  const controlPlaneWebUrl = process.env.CONTROL_PLANE_WEB_URL;
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(
    new Set(
      [controlPlaneWebUrl, ...(configuredOrigins ?? [])].filter((origin): origin is string =>
        Boolean(origin),
      ),
    ),
  );
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
    }),
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

  // ── Validation ──────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Routing ──────────────────────────────────────────────────────────────────
  // No URI versioning on the control plane — it is an internal staff tool
  // and breaking changes are coordinated with deployments, not API versions.
  app.setGlobalPrefix('api');

  const allowedOrigins = getAllowedCorsOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin '${origin}' is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-service-token'],
  });

  // ── Swagger (non-production only) ────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mobility OS — Control Plane API')
      .setDescription(
        'Platform governance: tenant lifecycle, plans, subscriptions, billing, ' +
          'platform wallets, metering, feature flags, and support operations.\n\n' +
          '⚠️ This API is restricted to platform staff roles only.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  // ── Listen ───────────────────────────────────────────────────────────────────
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port, '0.0.0.0');
  app.enableShutdownHooks(['SIGTERM']);
  console.log(`[api-control-plane] Listening on port ${port}`);
}

void bootstrap();
