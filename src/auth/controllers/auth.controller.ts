import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  LoginBodyDto,
  LoginResponseDto,
  logoutBadResponseDto,
  logoutResponseDto,
} from '../dto/auth.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { AuthenticatedGuard } from '../guards/authenticated.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { Response as Resp, Request as Re } from 'express';
import {
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  ResetPasswordDto,
} from '../dto/forgot-password.dto';
import { PasswordResetService } from '../services/password-reset.service';
import { CustomAuthGuard } from '../guards/custom-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private passwordResetService: PasswordResetService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginBodyDto })
  @Post('login')
  async login(@Request() req) {
    const data = await this.authService.login(req.user);
    console.log(req.user);
    return data;
  }

  @Post('signup')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiBody({ type: CreateUserDto })
  async signup(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    return new UserEntity(await this.authService.signup(createUserDto));
  }

  @UseGuards(CustomAuthGuard)
  @Post('google')
  async googleauth(@Request() req) {
    console.log(req.user);
    return {
      message: 'Login successful',
      user: req.user,
    };
  }
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    console.log('forgotPasswordDto', forgotPasswordDto);
    await this.passwordResetService.createPasswordResetToken(
      forgotPasswordDto.email,
    );
    return {
      message:
        'If an account with that email exists, you will receive a password reset link',
    };
  }
  @Get('validate-google-token/:token')
  async validateGoogleUser(@Request() req) {
    try {
      await this.authService.verifyGoogleToken(req.params.token);
      return {
        message: 'Google token is valid',
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a token' })
  @ApiOkResponse({ description: 'Password has been reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    console.log('resetPasswordDto', resetPasswordDto);
    await this.passwordResetService.resetPassword(resetPasswordDto);
    return { message: 'Password has been reset successfully' };
  }

  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // async googleAuth() {
  //   return { message: 'Redirecting to Google OAuth...' };
  // }

  // @Get('google/redirect')
  // @UseGuards(AuthGuard('google'))
  // async googleAuthRedirect(@Req() req, @Res() res) {
  //   const user = await this.authService.validateGoogleUser(req.user);
  //   if (user) {
  //     console.log(user);
  //     // res.redirect('https://digitalestimation.vercel.app/dashboard');
  //     return user;
  //     // res.redirect('http://localhost:3000/dashboard');
  //   }
  // }

  @UseGuards(AuthenticatedGuard)
  @Get('session')
  getSession(@Request() req: any) {
    if (req.user) {
      return {
        user: {
          ...req.user,
          companies: req.user.companies.map((company) => ({
            ...company,
            overtime_rate: company.overtime_rate?.toString(),
          })),
        },
      };
    } else {
      return { message: 'No user in session' };
    }
  }

  @Get('/logout')
  logout(@Request() req): any {
    console.log('called');
    console.log('sess', req.session);
    req.session.destroy();
    console.log('done');
    return { msg: 'The user session has ended' };
  }
}
