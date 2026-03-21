import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { RegisterOrganisationDto } from './dto/register-organisation.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SelfSignupService } from './self-signup.service';

class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code!: string;
}

@ApiTags('Self Signup')
@Controller('signup')
export class SelfSignupController {
  constructor(private readonly selfSignupService: SelfSignupService) {}

  @Post('register')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiCreatedResponse({ description: 'Organisation registered — OTP sent to admin email' })
  register(@Body() dto: RegisterOrganisationDto) {
    return this.selfSignupService.registerOrganisation(dto);
  }

  @Post('verify-otp')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOkResponse({ description: 'Email verified — welcome email sent' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    if (!dto.email?.trim() || !dto.code?.trim()) {
      throw new BadRequestException('email and code are required');
    }
    const result = await this.selfSignupService.verifyOrgSignupOtp(
      dto.email.trim(),
      dto.code.trim(),
    );
    if (!result.verified) {
      throw new BadRequestException('Invalid or expired verification code.');
    }
    return result;
  }
}
