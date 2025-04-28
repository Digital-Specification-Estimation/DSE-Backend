import { PrismaClient } from '@prisma/client';
import { Store } from 'express-session';

const prisma = new PrismaClient();

export class PrismaSessionStore extends Store {
  async get(sid: string, callback: (err: any, session?: any) => void) {
    try {
      const session = await prisma.session.findUnique({ where: { sid } });
      if (!session) {
        return callback(null, null);
      }
      if (session.expiresAt > new Date()) {
        callback(null, JSON.parse(session.data));
      } else {
        await this.destroy(sid);
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
      console.log('destroy function called');
      // Safe way: deleteMany does not throw if record doesn't exist
      await prisma.session.deleteMany({ where: { sid } });
      callback?.();
    } catch (error) {
      callback?.(error);
    }
  }
}
