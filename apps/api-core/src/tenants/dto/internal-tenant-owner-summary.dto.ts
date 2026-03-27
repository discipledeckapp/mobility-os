import { ApiPropertyOptional } from '@nestjs/swagger';

export class InternalTenantOwnerSummaryDto {
  @ApiPropertyOptional()
  ownerUserId?: string | null;

  @ApiPropertyOptional()
  ownerName?: string | null;

  @ApiPropertyOptional()
  ownerEmail?: string | null;

  @ApiPropertyOptional()
  ownerPhone?: string | null;

  @ApiPropertyOptional()
  ownerRole?: string | null;

  @ApiPropertyOptional()
  ownerIsActive?: boolean | null;

  @ApiPropertyOptional({ type: [Object] })
  adminContacts?: Array<{
    userId: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    isActive: boolean;
  }>;
}
