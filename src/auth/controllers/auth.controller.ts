import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  Response,
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
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiBody({ type: LoginBodyDto })
  @Post('login')
  async login(@Request() req) {
    const data = await this.authService.login(req.user);
    return data;
  }
  @Post('signup')
  @ApiCreatedResponse({ type: UserEntity })
  @ApiBody({ type: CreateUserDto })
  async signup(@Body() createUserDto: CreateUserDto) {
    return new UserEntity(await this.authService.signup(createUserDto));
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return { message: 'Redirecting to Google OAuth...' };
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const user = await this.authService.validateGoogleUser(req.user);
    if (user) {
      console.log(user);
      // res.redirect('https://digitalestimation.vercel.app/dashboard');
      return user;
      // res.redirect('http://localhost:3000/dashboard');
    }
  }
  @UseGuards(AuthenticatedGuard)
  @Get('session')
  getSession(@Request() req) {
    if (req.user) {
      return { user: req.user };
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
