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
  Patch,
  Delete,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthService } from '../../application/auth.service';
import { AdminService } from '../../../admin/application/admin.service';
import { SubscriptionService } from '../../../subscription/application/subscription.service';
import { JwtAuthGuard } from '../../../../common/auth/guards/jwt-auth.guard';
import { 
  type AuthUser, 
  GetUser,
  Public 
} from '@workshop/shared';
import { RegisterData } from '../../domain/auth.repository';

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterData) {
    return this.authService.register(dto);
  }

  @Public()
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
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.getProfileWithModules(req.user.userId, req.user.tenantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-context')
  @HttpCode(HttpStatus.OK)
  async switchContext(
    @Body() body: { tenantId: string },
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.switchContext(req.user.userId, body.tenantId);

    // Refresh HttpOnly cookie with the new token (new context)
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

  @Public()
  @Get('impersonate')
  async impersonate(
    @Query('token') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Set HttpOnly cookie with the impersonation token
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    });

    return { success: true };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('access_token', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @GetUser() user: AuthUser,
    @Body() dto: { firstName?: string; lastName?: string; password?: string }
  ) {
    return this.authService.updateProfile(user.userId, dto);
  }
}

