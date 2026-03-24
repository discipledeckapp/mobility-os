import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function getAllowedCorsOrigins(): string[] {
  const tenantWebUrl = process.env.TENANT_WEB_URL;
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(
    new Set(
      [tenantWebUrl, ...(configuredOrigins ?? [])].filter((origin): origin is string =>
        Boolean(origin),
      ),
    ),
  );
}

async function bootstrap(): Promise<void> {
  const configuredMaxDocumentBytes = Number.parseInt(
    process.env.DOCUMENT_STORAGE_MAX_FILE_BYTES ?? '',
    10,
  );
  const bodyLimit = Number.isFinite(configuredMaxDocumentBytes) && configuredMaxDocumentBytes > 0
    ? Math.max(configuredMaxDocumentBytes * 2, 20 * 1024 * 1024)
    : 20 * 1024 * 1024;
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit,
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
  app.useGlobalGuards(app.get(ThrottlerGuard));
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Routing ──────────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // Resulting base path for all tenant routes: /api/v1/...

  const allowedOrigins = getAllowedCorsOrigins();
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin '${origin}' is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-internal-service-token'],
  });

  app.getHttpAdapter().getInstance().addHook('onSend', (_request, reply, payload, done) => {
    reply.header('x-content-type-options', 'nosniff');
    reply.header('x-frame-options', 'DENY');
    reply.header('referrer-policy', 'no-referrer');
    reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    reply.header('cross-origin-resource-policy', 'same-site');
    done(null, payload);
  });

  // ── Swagger (non-production only) ────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mobility OS — Core API')
      .setDescription(
        'Tenant operations plane: fleet, vehicles, drivers, assignments, ' +
          'remittance, accounting, and operational wallets.',
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
  console.log(`[api-core] Listening on port ${port}`);
}

void bootstrap();
