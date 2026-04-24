import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { StaffService } from '../../application/staff.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { 
  CheckPermissions, 
  PermissionAction, 
  type AuthUser,
  GetUser
} from '@workshop/shared';
import { 
  StaffQuery, 
  CreateStaffDto, 
  UpdateStaffDto, 
  UpdateFieldDto 
} from '../../domain/staff.repository';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @CheckPermissions(PermissionAction.STAFF_CREATE)
  async create(@GetUser() user: AuthUser, @Body() dto: CreateStaffDto) {
    return this.staffService.create(user.tenantId, user.userId, dto);
  }

  @Get()
  @CheckPermissions(PermissionAction.STAFF_READ)
  async findAll(@GetUser() user: AuthUser, @Query() query: StaffQuery) {
    const branchId = user.role !== 'workshop_owner' ? (user.branchId || undefined) : query.branchId;
    return this.staffService.findAll(user.tenantId, { ...query, branchId });
  }

  @Get(':id')
  @CheckPermissions(PermissionAction.STAFF_READ)
  async findOne(@GetUser() user: AuthUser, @Param('id') id: string) {
    const branchId = user.role !== 'workshop_owner' ? (user.branchId || undefined) : undefined;
    return this.staffService.findOne(id, user.tenantId, branchId);
  }

  @Put(':id')
  @CheckPermissions(PermissionAction.STAFF_UPDATE)
  async updateGroup(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    const branchId = user.role !== 'workshop_owner' ? (user.branchId || undefined) : undefined;
    return this.staffService.updateGroup(id, user.tenantId, user.userId, dto, branchId);
  }

  @Patch(':id')
  @CheckPermissions(PermissionAction.STAFF_UPDATE)
  async updateField(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFieldDto,
  ) {
    const branchId = user.role !== 'workshop_owner' ? (user.branchId || undefined) : undefined;
    return this.staffService.updateField(id, user.tenantId, user.userId, dto, branchId);
  }

  @Delete(':id')
  @CheckPermissions(PermissionAction.STAFF_DELETE)
  async remove(@GetUser() user: AuthUser, @Param('id') id: string) {
    const branchId = user.role !== 'workshop_owner' ? (user.branchId || undefined) : undefined;
    return this.staffService.remove(id, user.tenantId, user.userId, branchId);
  }
}
