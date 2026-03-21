import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreatePlanDto } from './dto/create-plan.dto';
import { PlanResponseDto } from './dto/plan-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PlansService } from './plans.service';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOkResponse({ type: [PlanResponseDto] })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  listPlans(@Query('activeOnly') activeOnly?: string): Promise<PlanResponseDto[]> {
    return this.plansService.listPlans(activeOnly !== 'false');
  }

  @Get(':id')
  @ApiOkResponse({ type: PlanResponseDto })
  getPlan(@Param('id') id: string): Promise<PlanResponseDto> {
    return this.plansService.getPlan(id);
  }

  @Post()
  @ApiCreatedResponse({ type: PlanResponseDto })
  createPlan(@Body() dto: CreatePlanDto): Promise<PlanResponseDto> {
    return this.plansService.createPlan(dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PlanResponseDto, description: 'Plan deactivated' })
  deactivatePlan(@Param('id') id: string): Promise<PlanResponseDto> {
    return this.plansService.deactivatePlan(id);
  }
}
