import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RedisService } from '../infrastructure/redis/redis.service.js';

@Injectable()
export class TemporaryLoginLimiter {
  constructor(@Inject(RedisService) private readonly redis: RedisService) {}

  /** Five attempts per identifier per 15 minutes, including unknown identifiers.
   * Count before bcrypt; CAS preserves TTL and prevents parallel bypass. Fail closed. */
  async consume(identifier: string) {
    const key = `auth:temporary-login:${createHash('sha256').update(identifier).digest('hex')}`;
    if (await this.redis.setIfAbsent(key, JSON.stringify({ attempts: 1 }), 900))
      return;
    while (true) {
      const record = await this.redis.getJSON<{ attempts: number }>(key);
      if (!record) {
        if (
          await this.redis.setIfAbsent(
            key,
            JSON.stringify({ attempts: 1 }),
            900,
          )
        )
          return;
        continue;
      }
      if (record.attempts >= 5)
        throw new HttpException(
          'Too many temporary login attempts. Retry after 15 minutes.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      if (
        await this.redis.compareAndSwapJSON(key, record, {
          attempts: record.attempts + 1,
        })
      )
        return;
    }
  }
}
