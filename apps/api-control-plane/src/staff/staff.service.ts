import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
// biome-ignore lint/style/useImportType: Nest DI requires runtime class metadata.
import { PrismaService } from '../database/prisma.service';
import { hashPassword } from '../auth/password-utils';
import type { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import type { StaffMemberResponseDto } from './dto/staff-member-response.dto';

type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

type PlatformUsersDelegate = {
  findMany(args: { orderBy?: { createdAt?: 'asc' | 'desc' } }): Promise<StaffRow[]>;
  findFirst(args: { where: { email?: string; id?: string } }): Promise<StaffRow | null>;
  create(args: { data: { name: string; email: string; role: string; passwordHash: string; isActive: boolean } }): Promise<StaffRow>;
  update(args: { where: { id: string }; data: { isActive: boolean } }): Promise<StaffRow>;
};

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  private get platformUsers(): PlatformUsersDelegate {
    // TODO(control-plane-prisma): Prisma delegate typing can lag after schema changes.
    return (this.prisma as unknown as { cpPlatformUser: PlatformUsersDelegate }).cpPlatformUser;
  }

  async listStaff(): Promise<StaffMemberResponseDto[]> {
    const users = await this.platformUsers.findMany({ orderBy: { createdAt: 'asc' } });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  async createStaffMember(dto: CreateStaffMemberDto): Promise<StaffMemberResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.platformUsers.findFirst({ where: { email } });

    if (existing) {
      throw new ConflictException(`A platform user with email '${email}' already exists.`);
    }

    const user = await this.platformUsers.create({
      data: {
        name: dto.name.trim(),
        email,
        role: dto.role,
        passwordHash: hashPassword(dto.password),
        isActive: true,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async deactivateStaffMember(userId: string): Promise<{ message: string }> {
    const user = await this.platformUsers.findFirst({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Staff member not found.');
    }

    await this.platformUsers.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: 'Staff member deactivated.' };
  }
}
