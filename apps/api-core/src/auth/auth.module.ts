import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ControlPlaneLifecycleClient } from './control-plane-lifecycle.client';
import { InternalServiceAuthGuard } from './guards/internal-service-auth.guard';
import { MobileAuthGuard } from './guards/mobile-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { TenantAuthGuard } from './guards/tenant-auth.guard';
import { TenantLifecycleGuard } from './guards/tenant-lifecycle.guard';

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MobileAuthGuard,
    TenantAuthGuard,
    TenantLifecycleGuard,
    PermissionsGuard,
    InternalServiceAuthGuard,
    ControlPlaneLifecycleClient,
  ],
  exports: [
    JwtModule,
    AuthService,
    MobileAuthGuard,
    TenantAuthGuard,
    TenantLifecycleGuard,
    PermissionsGuard,
    InternalServiceAuthGuard,
    ControlPlaneLifecycleClient,
  ],
})
export class AuthModule {}
