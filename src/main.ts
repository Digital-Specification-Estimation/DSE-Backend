import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from './prisma/utils/prismaSession.store';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();
const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'));
  
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProduction 
    ? ['https://digitalestimation.vercel.app', 'https://dse-frontend.vercel.app', 'https://dse-app.vercel.app']
    : ['http://localhost:3000'];

  logger.log(`Running in ${isProduction ? 'production' : 'development'} mode`);
  logger.log(`Allowed origins: ${allowedOrigins.join(', ')}`);

  // Enhanced CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        logger.log(`Allowed CORS for origin: ${origin}`);
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS for origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  
  // Swagger configuration
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

  // Session configuration with enhanced logging
  const prisma = new PrismaClient();
  const sessionConfig: session.SessionOptions = {
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
      path: '/',
    },
  };

  logger.log('Session configuration:', JSON.stringify({
    ...sessionConfig,
    secret: '***', // Don't log the actual secret
    store: 'PrismaSessionStore',
  }, null, 2));

  app.use(session(sessionConfig));
  
  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  
  // Log environment information
  logger.log('Environment variables:', JSON.stringify({
    NODE_ENV: process.env.NODE_ENV,
    NODE_APP_INSTANCE: process.env.NODE_APP_INSTANCE,
    SESSION_SECRET_KEY: process.env.SESSION_SECRET_KEY ? '***' : 'Not set',
  }, null, 2));
}

bootstrap().catch(err => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
