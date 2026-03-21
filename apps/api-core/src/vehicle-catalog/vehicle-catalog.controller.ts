import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TenantAuthGuard } from '../auth/guards/tenant-auth.guard';
import { TenantLifecycleGuard } from '../auth/guards/tenant-lifecycle.guard';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateVehicleMakerDto } from './dto/create-vehicle-maker.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { CreateVehicleModelDto } from './dto/create-vehicle-model.dto';
// biome-ignore lint/style/useImportType: DTO classes are used by Nest decorators at runtime.
import { DecodeVehicleVinDto } from './dto/decode-vehicle-vin.dto';
import { VehicleMakerResponseDto } from './dto/vehicle-maker-response.dto';
import { VehicleModelResponseDto } from './dto/vehicle-model-response.dto';
import { VehicleVinDecodeResponseDto } from './dto/vehicle-vin-decode-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { VehicleCatalogService } from './vehicle-catalog.service';

@ApiTags('Vehicle Catalog')
@ApiBearerAuth()
@UseGuards(TenantAuthGuard, TenantLifecycleGuard)
@Controller('vehicle-catalog')
export class VehicleCatalogController {
  constructor(private readonly service: VehicleCatalogService) {}

  @Get('makers')
  @ApiOkResponse({ type: [VehicleMakerResponseDto] })
  @ApiQuery({ name: 'q', required: false })
  listMakers(@Query('q') q?: string): Promise<VehicleMakerResponseDto[]> {
    return this.service.listMakers(q);
  }

  @Post('makers')
  @ApiCreatedResponse({ type: VehicleMakerResponseDto })
  createMaker(@Body() dto: CreateVehicleMakerDto): Promise<VehicleMakerResponseDto> {
    return this.service.createMaker(dto);
  }

  @Get('models')
  @ApiOkResponse({ type: [VehicleModelResponseDto] })
  @ApiQuery({ name: 'makerId', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'vehicleType', required: false })
  listModels(
    @Query('makerId') makerId?: string,
    @Query('q') q?: string,
    @Query('vehicleType') vehicleType?: string,
  ): Promise<VehicleModelResponseDto[]> {
    return this.service.listModels({
      ...(makerId ? { makerId } : {}),
      ...(q ? { q } : {}),
      ...(vehicleType ? { vehicleType } : {}),
    });
  }

  @Post('models')
  @ApiCreatedResponse({ type: VehicleModelResponseDto })
  createModel(@Body() dto: CreateVehicleModelDto): Promise<VehicleModelResponseDto> {
    return this.service.createModel(dto);
  }

  @Post('decode-vin')
  @ApiCreatedResponse({ type: VehicleVinDecodeResponseDto })
  decodeVin(@Body() dto: DecodeVehicleVinDto): Promise<VehicleVinDecodeResponseDto> {
    return this.service.decodeVin(dto);
  }
}
