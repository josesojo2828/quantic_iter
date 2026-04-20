import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { AuthService } from '../../application/auth.service';
import { RegisterData } from '../../domain/auth.repository';

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterData) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    // Set HttpOnly cookie
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return {
      user: result.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('worker')
  async inviteWorker(@Req() req: any, @Body() dto: any) {
    const ownerTenantId = req.user.tenantId;
    return this.authService.inviteWorker(ownerTenantId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('worker')
  async getWorkers(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.authService.getWorkers(tenantId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.getProfileWithModules(req.user.userId);
  }



}

