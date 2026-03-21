import { ApiProperty } from '@nestjs/swagger';

export class TenantListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  country!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ nullable: true })
  planName!: string | null;

  @ApiProperty({ nullable: true })
  planTier!: string | null;

  @ApiProperty({ nullable: true })
  subscriptionStatus!: string | null;

  @ApiProperty()
  createdAt!: Date;
}
