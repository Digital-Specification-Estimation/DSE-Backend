import { PrismaClient } from '@prisma/client';
import { Store } from 'express-session';

const prisma = new PrismaClient();

export class PrismaSessionStore extends Store {
  async get(sid: string, callback: (err: any, session?: any) => void) {
    try {
      const session = await prisma.session.findUnique({ where: { sid } });
      if (!session) {
        throw new Error('Session not found');
      }
      console.log('session calling');
      if (session && session.expiresAt > new Date()) {
        callback(null, JSON.parse(session.data));
      } else {
        callback(null, null);
      }
    } catch (error) {
      callback(error);
    }
  }

  async set(sid: string, session: any, callback?: (err?: any) => void) {
    try {
      console.log('session', session);
      await prisma.session.upsert({
        where: { sid },
        update: {
          data: JSON.stringify(session),
          expiresAt: new Date(Date.now() + session.cookie.maxAge),
        },
        create: {
          sid,
          data: JSON.stringify(session),
          expiresAt: new Date(Date.now() + session.cookie.maxAge),
        },
      });
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await prisma.session.delete({ where: { sid } });
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }
}
