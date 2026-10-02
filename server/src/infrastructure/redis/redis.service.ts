import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host =
      (configService && configService.get<string>('redis.host')) ||
      process.env.REDIS_HOST ||
      'localhost';
    const port =
      (configService && configService.get<number>('redis.port')) ||
      parseInt(process.env.REDIS_PORT || '6379', 10);
    const password =
      (configService && configService.get<string>('redis.password')) ||
      process.env.REDIS_PASSWORD;

    this.client = new Redis({
      host,
      port,
      password: password && password.length > 0 ? password : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });

    this.client.on('error', (err) => this.logger.error(err.message));
    this.client.on('connect', () => this.logger.log('Redis connected'));
  }

  get raw(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds !== undefined) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Reserve a temporary marker once, including concurrent callers. */
  async setIfAbsent(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    return (await this.client.set(key, value, 'EX', ttlSeconds, 'NX')) === 'OK';
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const n = await this.client.exists(key);
    return n === 1;
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const s = JSON.stringify(value);
    if (ttlSeconds !== undefined) {
      await this.client.set(key, s, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, s);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const s = await this.client.get(key);
    if (s === null) return null;
    try {
      return JSON.parse(s) as T;
    } catch {
      return null;
    }
  }

  /** Atomically replace/delete an unchanged JSON record without extending its TTL. */
  async compareAndSwapJSON<T>(
    key: string,
    expected: T,
    replacement?: T,
  ): Promise<boolean> {
    const result = await this.client.eval(
      `if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
       if ARGV[2] == '' then
         redis.call('DEL', KEYS[1])
       else
         local ttl = redis.call('PTTL', KEYS[1])
         if ttl <= 0 then return 0 end
         redis.call('SET', KEYS[1], ARGV[2], 'PX', ttl)
       end
       return 1`,
      1,
      key,
      JSON.stringify(expected),
      replacement === undefined ? '' : JSON.stringify(replacement),
    );
    return result === 1;
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const r = await this.client.expire(key, ttlSeconds);
    return r === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    let cursor = '0';
    do {
      const [next, batch] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = next;
      if (batch.length > 0) {
        await this.client.del(...batch);
      }
    } while (cursor !== '0');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
