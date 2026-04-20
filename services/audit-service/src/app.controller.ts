import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { type AuditPayload } from '@workshop/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('audit.log')
  async handleAuditLog(@Payload() data: AuditPayload) {
    await this.appService.logActivity(data);
  }
}
