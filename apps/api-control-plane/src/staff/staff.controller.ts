import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PlatformAuthGuard } from '../auth/guards/platform-auth.guard';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { CreateStaffInvitationDto } from './dto/create-staff-invitation.dto';
import { CompleteStaffInvitationDto } from './dto/complete-staff-invitation.dto';
import { StaffInvitationPreviewDto } from './dto/staff-invitation-preview.dto';
import { StaffMemberResponseDto } from './dto/staff-member-response.dto';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { StaffService } from './staff.service';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(PlatformAuthGuard)
  @ApiOkResponse({ type: [StaffMemberResponseDto] })
  listStaff(): Promise<StaffMemberResponseDto[]> {
    return this.staffService.listStaff();
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(PlatformAuthGuard)
  @ApiCreatedResponse({ type: StaffMemberResponseDto })
  createStaffMember(@Body() dto: CreateStaffMemberDto): Promise<StaffMemberResponseDto> {
    return this.staffService.createStaffMember(dto);
  }

  @Post('invitations')
  @ApiBearerAuth()
  @UseGuards(PlatformAuthGuard)
  @ApiCreatedResponse({ type: StaffMemberResponseDto })
  createStaffInvitation(@Body() dto: CreateStaffInvitationDto): Promise<StaffMemberResponseDto> {
    return this.staffService.createStaffInvitation(dto);
  }

  @Get('invitations/resolve')
  @ApiOkResponse({ type: StaffInvitationPreviewDto })
  previewInvitation(@Query('token') token: string): Promise<StaffInvitationPreviewDto> {
    return this.staffService.previewInvitation(token);
  }

  @Post('invitations/complete')
  @ApiOkResponse()
  completeInvitation(@Body() dto: CompleteStaffInvitationDto): Promise<{ message: string }> {
    return this.staffService.completeInvitation(dto);
  }

  @Delete(':userId')
  @ApiBearerAuth()
  @UseGuards(PlatformAuthGuard)
  @ApiOkResponse()
  deactivateStaffMember(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.staffService.deactivateStaffMember(userId);
  }
}
