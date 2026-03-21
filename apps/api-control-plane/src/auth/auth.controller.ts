import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { AuthService } from './auth.service';
import { PlatformLoginResponseDto } from './dto/platform-login-response.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { PlatformLoginDto } from './dto/platform-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: PlatformLoginResponseDto })
  login(@Body() dto: PlatformLoginDto): Promise<PlatformLoginResponseDto> {
    return this.authService.login(dto);
  }
}
