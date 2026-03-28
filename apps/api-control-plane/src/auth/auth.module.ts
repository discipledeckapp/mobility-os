import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InternalServiceAuthGuard } from './guards/internal-service-auth.guard';
import { PlatformAuthGuard } from './guards/platform-auth.guard';
import { PlatformRolesGuard } from './guards/platform-roles.guard';

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        // Intentionally using PLATFORM_JWT_SECRET — not JWT_SECRET.
        // The two secrets must never be swapped.
        secret: config.getOrThrow<string>('PLATFORM_JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('PLATFORM_JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PlatformAuthGuard, InternalServiceAuthGuard, PlatformRolesGuard],
  exports: [
    JwtModule,
    AuthService,
    PlatformAuthGuard,
    InternalServiceAuthGuard,
    PlatformRolesGuard,
  ],
})
export class AuthModule {}
