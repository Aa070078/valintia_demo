import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  mailConfig,
  otpConfig,
  r2Config,
  redisConfig,
  swaggerConfig,
  throttleConfig,
} from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        throttleConfig,
        r2Config,
        swaggerConfig,
        otpConfig,
        mailConfig,
      ],
    }),
  ],
})
export class AppConfigModule {}