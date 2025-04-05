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

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://digitalestimation.vercel.app'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  app.useGlobalPipes(new ValidationPipe());
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
      // secret: process.env.SESSION_SECRET_KEY,
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      //secure:true -> production
      cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24, httpOnly: false },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
