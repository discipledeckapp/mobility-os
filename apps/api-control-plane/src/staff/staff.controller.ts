import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { StaffMemberResponseDto } from './dto/staff-member-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { StaffService } from './staff.service';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(PlatformAuthGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiOkResponse({ type: [StaffMemberResponseDto] })
  listStaff(): Promise<StaffMemberResponseDto[]> {
    return this.staffService.listStaff();
  }

  @Post()
  @ApiCreatedResponse({ type: StaffMemberResponseDto })
  createStaffMember(@Body() dto: CreateStaffMemberDto): Promise<StaffMemberResponseDto> {
    return this.staffService.createStaffMember(dto);
  }

  @Delete(':userId')
  @ApiOkResponse()
  deactivateStaffMember(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.staffService.deactivateStaffMember(userId);
  }
}
