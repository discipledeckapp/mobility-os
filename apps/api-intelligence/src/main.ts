import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  // Resulting base path: /api/v1/...

  // ── Swagger (non-production only) ────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mobility OS — Intelligence API')
      .setDescription(
        'Cross-tenant intelligence plane: canonical person graph, ' +
          'biometric uniqueness, identity resolution, risk scoring, ' +
          'watchlists, and fraud signals.\n\n' +
          'Tenant callers receive only derived risk signals — never raw ' +
          'cross-tenant records. Platform staff have full access for ' +
          'review-case adjudication.',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'platform-staff')
      .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'tenant-api-key')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  // ── Listen ───────────────────────────────────────────────────────────────────
  const port = Number.parseInt(process.env.PORT ?? '3002', 10);
  await app.listen(port, '0.0.0.0');
  app.enableShutdownHooks(['SIGTERM']);
  console.log(`[api-intelligence] Listening on port ${port}`);
}

void bootstrap();
