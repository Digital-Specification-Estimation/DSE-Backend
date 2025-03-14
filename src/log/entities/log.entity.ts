import { Log } from '@prisma/client';

export class LogEntity implements Log {
  constructor(partial: Partial<Log> | null) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
  id: string;
  user_id: string;
  action: string;
}
