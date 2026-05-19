import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards
} from '@nestjs/common';
import { BranchService } from '../../application/branch.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import type { CreateBranchDto, UpdateBranchDto, BranchQuery } from '../../domain/branch.repository';
import { 
  CheckPermissions, 
  GetUser,
} from '@mentor/shared/nestjs';
import { PermissionAction } from '@mentor/shared';
import type { AuthUser } from '@mentor/shared/nestjs';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @CheckPermissions(PermissionAction.BRANCHES_READ)
  findAll(@GetUser() user: AuthUser, @Query() query: BranchQuery) {
    return this.branchService.findAll(user.tenantId, query);
  }

  @Get(':id')
  @CheckPermissions(PermissionAction.BRANCHES_READ)
  findOne(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.branchService.findOne(id, user.tenantId);
  }

  @Post()
  @CheckPermissions(PermissionAction.BRANCHES_CREATE)
  create(@GetUser() user: AuthUser, @Body() dto: CreateBranchDto) {
    return this.branchService.create(user.tenantId, user.userId, dto);
  }

  @Put(':id')
  @CheckPermissions(PermissionAction.BRANCHES_UPDATE)
  update(
    @GetUser() user: AuthUser, 
    @Param('id') id: string, 
    @Body() dto: UpdateBranchDto
  ) {
    return this.branchService.update(id, user.tenantId, user.userId, dto);
  }

  @Delete(':id')
  @CheckPermissions(PermissionAction.BRANCHES_DELETE)
  remove(@GetUser() user: AuthUser, @Param('id') id: string) {
    return this.branchService.remove(id, user.tenantId, user.userId);
  }
}
