import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { UpdateFeatureFlagDto } from './dto/update-feature-flag.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { SetOverrideParams } from './feature-flags.service';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { FeatureFlagsService } from './feature-flags.service';

@ApiTags('Feature Flags')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly service: FeatureFlagsService) {}

  @Get()
  @ApiOkResponse({ description: 'All feature flags with their overrides' })
  @ApiQuery({ name: 'enabledOnly', required: false, type: Boolean })
  listFlags(@Query('enabledOnly') enabledOnly?: string) {
    return this.service.listFlags(enabledOnly === 'true');
  }

  @Get(':key')
  @ApiOkResponse({ description: 'A single feature flag with all overrides' })
  getFlag(@Param('key') key: string) {
    return this.service.getFlag(key);
  }

  @Get(':key/evaluate')
  @ApiOkResponse({ description: 'Resolved boolean for a given context' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'planTier', required: false })
  @ApiQuery({ name: 'countryCode', required: false })
  isEnabled(
    @Param('key') key: string,
    @Query('tenantId') tenantId?: string,
    @Query('planTier') planTier?: string,
    @Query('countryCode') countryCode?: string,
  ): Promise<boolean> {
    return this.service.isEnabled(key, {
      ...(tenantId ? { tenantId } : {}),
      ...(planTier ? { planTier } : {}),
      ...(countryCode ? { countryCode } : {}),
    });
  }

  @Post(':key/overrides')
  @ApiCreatedResponse({ description: 'Override created' })
  setOverride(@Param('key') key: string, @Body() body: Omit<SetOverrideParams, 'flagId'>) {
    return this.service.setOverride({ ...body, flagId: key });
  }

  @Patch(':key')
  @ApiOkResponse({ description: 'Feature flag updated' })
  updateFlag(@Param('key') key: string, @Body() body: UpdateFeatureFlagDto) {
    return this.service.updateFlag(key, body);
  }

  @Delete('overrides/:overrideId')
  @ApiNoContentResponse({ description: 'Override removed' })
  removeOverride(@Param('overrideId') overrideId: string): Promise<void> {
    return this.service.removeOverride(overrideId);
  }
}
