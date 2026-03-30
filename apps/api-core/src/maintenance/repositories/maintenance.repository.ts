import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findVehicle(tenantId: string, vehicleId: string) {
    return this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
      select: { id: true, fleetId: true, status: true },
    });
  }

  findWorkOrder(tenantId: string, workOrderId: string) {
    return this.prisma.workOrder.findFirst({
      where: { id: workOrderId, tenantId },
      include: { costs: true },
    });
  }

  listVehicleWorkOrders(tenantId: string, vehicleId: string) {
    return this.prisma.workOrder.findMany({
      where: { tenantId, vehicleId },
      include: { costs: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listTenantWorkOrders(tenantId: string, skip = 0, take = 50) {
    return this.prisma.workOrder.findMany({
      where: { tenantId },
      include: { costs: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  countTenantWorkOrders(tenantId: string) {
    return this.prisma.workOrder.count({
      where: { tenantId },
    });
  }
}
