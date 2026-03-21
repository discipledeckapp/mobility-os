import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PlatformAuthGuard } from './guards/platform-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('PLATFORM_JWT_SECRET'),
      }),
    }),
  ],
  providers: [PlatformAuthGuard],
  exports: [JwtModule, PlatformAuthGuard],
})
export class AuthModule {}
