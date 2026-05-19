import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ResourceService } from '../../application/resource.service';
import { ScopeGuard } from '../../../../common/guards/scope.guard';
import { type Request } from 'express';

@Controller('resources')
@UseGuards(ScopeGuard)
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.createResource(dto, scope);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getAllResources(scope);
  }

  @Get('me')
  async getMyLibrary(@Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getMyLibrary(scope);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.getResourceById(id, scope);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.updateResource(id, dto, scope);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).scope;
    return this.service.deleteResource(id, scope);
  }
}
