import { Injectable, NotFoundException, Inject } from '@nestjs/common';

import type { IStaffRepository } from '../domain/staff.repository';
import {
  StaffQuery,
  CreateStaffDto,
  UpdateStaffDto,
  UpdateFieldDto,
} from '../domain/staff.repository';
import * as bcrypt from 'bcrypt';
import { type IEventBus } from '../../../common/events/event-bus.interface';
import { UserRoleChangedEvent } from '../domain/events/user-role-changed.event';


import { StaffMember } from '../domain/staff-member.entity';
import { SubscriptionService } from '../../subscription/application/subscription.service';

@Injectable()
export class StaffService {
  constructor(
    @Inject('IStaffRepository')
    private readonly staffRepository: IStaffRepository,
    @Inject('IEventBus') private readonly eventBus: IEventBus,
    private readonly subscriptionService: SubscriptionService,
  ) { }

  private readonly AVATAR_POOL = [
    'avatar_female_1.png',
    'avatar_male_1.png',
    'avatar_neutral_1.png',
    'avatar_female_2.png',
    'avatar_male_2.png',
    'avatar_female_3.png',
    'avatar_male_3.png',
    'avatar_female_4.png',
    'avatar_male_4.png',
    'avatar_female_5.png',
    'avatar_male_5.png',
    'avatar_neutral_2.png',
    'avatar_female_6.png',
    'avatar_female_7.png',
    'avatar_male_6.png',
    'avatar_neutral_3.png',
  ];

  private getRandomAvatar(): string {
    const randomIndex = Math.floor(Math.random() * this.AVATAR_POOL.length);
    return this.AVATAR_POOL[randomIndex];
  }

  async findAll(tenantId: string, query: StaffQuery) {
    const { items, total } = await this.staffRepository.findAll(
      tenantId,
      query,
    );
    return {
      items,
      total,
      skip: query.skip || 0,
      take: query.take || 10,
    };
  }

  async findOne(id: string, tenantId: string, branchId?: string) {
    const user = await this.staffRepository.findById(id, tenantId, branchId);
    if (!user) throw new NotFoundException('Empleado no encontrado');
    return user;
  }

  async create(tenantId: string, userId: string, dto: CreateStaffDto) {
    // 1. Validate subscription and user limits
    await this.subscriptionService.checkUserLimit(tenantId);

    const password = await bcrypt.hash(dto.password || 'mentor123', 10);
    const newUser = await this.staffRepository.create({
      ...dto,
      tenantId,
      password,
      roleSlug: dto.roleSlug || 'facilitator',
      avatarUrl: this.getRandomAvatar(),
    });


    return newUser;
  }

  async updateGroup(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateStaffDto,
    userBranchId?: string,
  ) {
    const current = await this.findOne(id, tenantId, userBranchId);
    const updated = await this.staffRepository.update(id, dto);

    // Si el rol cambió, emitimos el evento de auditoría
    if (dto.roleSlug && dto.roleSlug !== current.role?.slug) {
      await this.eventBus.publish(new UserRoleChangedEvent(id, {
        tenantId,
        userId: id,
        newRoles: [dto.roleSlug],
        changedBy: userId,
      }));
    }

    return updated;
  }

  async updateField(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateFieldDto,
    userBranchId?: string,
  ) {
    const current = await this.findOne(id, tenantId, userBranchId);
    const updated = await this.staffRepository.update(id, {
      [dto.field]: dto.value,
    } as UpdateStaffDto);


    return updated;
  }

  async remove(id: string, tenantId: string, userId: string, userBranchId?: string) {
    await this.findOne(id, tenantId, userBranchId);
    await this.staffRepository.softDelete(id);


    return { success: true };
  }
}
