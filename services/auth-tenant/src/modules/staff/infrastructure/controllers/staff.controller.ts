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
  PermissionsGuard,
  CheckPermissions,
  PermissionAction,
} from '@workshop/shared/nestjs';
import {
  StaffQuery,
  CreateStaffDto,
  UpdateStaffDto,
  UpdateFieldDto,
} from '../../domain/staff.repository';
import { GetUser } from '../../../../common/auth/decorators/get-user.decorator';
import { AuthUser } from '../../../../common/auth/interfaces/auth-user.interface';

@Controller('staff')
@UseGuards(JwtAuthGuard)
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
    return this.staffService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @CheckPermissions(PermissionAction.STAFF_READ)
  async findOne(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.staffService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @CheckPermissions(PermissionAction.STAFF_UPDATE)
  async updateGroup(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.updateGroup(id, user.tenantId, user.userId, dto);
  }

  @Patch(':id')
  @CheckPermissions(PermissionAction.STAFF_UPDATE)
  async updateField(
    @GetUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateFieldDto,
  ) {
    return this.staffService.updateField(id, user.tenantId, user.userId, dto);
  }

  @Delete(':id')
  @CheckPermissions(PermissionAction.STAFF_DELETE)
  async remove(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.staffService.remove(id, user.tenantId, user.userId);
  }
}
