import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('redis.host');
    const port = this.configService.get<number>('redis.port');
    const password = this.configService.get<string>('redis.password');

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
