import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from './prisma/utils/prismaSession.store';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction 
    ? ['https://digitalestimation.vercel.app', 'https://dse-frontend.vercel.app', 'https://dse-app.vercel.app']
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  app.set("trust proxy", 1);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  const config = new DocumentBuilder()
    .setTitle('DSE Backend')
    .setDescription('Digital-Specification-Estimation backend system')
    .setContact(
      'MUGISHA Pascal',
      'https://mugisha-pascal.vercel.app/',
      'mugishapascal2008@gmail.com',
    )
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const prisma = new PrismaClient();
  app.use(
    session({
      store: new PrismaSessionStore(),
      secret: process.env.SESSION_SECRET_KEY || 'fallback-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        domain: isProduction ? '.vercel.app' : undefined,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

