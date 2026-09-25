import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './infrastructure/config/config.module';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
// import { ApplicationLogsModule } from './infrastructure/application-logs/application-logs.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    RedisModule,
    // ApplicationLogsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
