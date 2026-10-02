import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../dist/infrastructure/redis/redis.service.js';

// Explicit integration check: only temporary, randomly named test keys are touched.
test('real Redis CAS preserves TTL, rejects stale updates and permits one consumer', async () => {
  const redis = new RedisService(
    new ConfigService({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD ?? '',
      },
    }),
  );
  const key = `test:otp:cas:${randomUUID()}`;
  const cooldownKey = `${key}:cooldown`;
  try {
    await redis.ping();
    assert.deepEqual(
      (
        await Promise.all([
          redis.setIfAbsent(cooldownKey, '1', 10),
          redis.setIfAbsent(cooldownKey, '1', 10),
        ])
      ).sort(),
      [false, true],
    );
    const original = { code: '123456', attempts: 0, createdAt: Date.now() };
    const updated = { ...original, attempts: 1 };
    await redis.setJSON(key, original, 10);
    const ttlBefore = await redis.raw.pttl(key);
    assert.equal(await redis.compareAndSwapJSON(key, original, updated), true);
    const ttlAfter = await redis.raw.pttl(key);
    assert.ok(ttlAfter > 0 && ttlAfter <= ttlBefore);
    assert.deepEqual(await redis.getJSON(key), updated);
    assert.equal(await redis.compareAndSwapJSON(key, original), false);
    assert.deepEqual(
      (
        await Promise.all([
          redis.compareAndSwapJSON(key, updated),
          redis.compareAndSwapJSON(key, updated),
        ])
      ).sort(),
      [false, true],
    );
    assert.equal(await redis.getJSON(key), null);
    assert.equal(await redis.compareAndSwapJSON(key, updated, original), false);
  } finally {
    if (redis.raw.status === 'ready') {
      await redis.del(key);
      await redis.del(cooldownKey);
    }
    redis.raw.disconnect();
  }
});
