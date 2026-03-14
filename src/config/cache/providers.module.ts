import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { moduleConfig } from '@/config/env/main.config';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      useFactory: async () => {
        const redisConfig = {
          socket: {
            host: moduleConfig.redisHost,
            port: moduleConfig.redisPort,
            timeout: 60000,
          },
          ttl: moduleConfig.redisCacheTtl,
        } as RedisClientOptions;

        if (process.env.REDIS_TLS === 'true') {
          (redisConfig.socket as Record<string, number | string | boolean>).tls = true;
          if (moduleConfig.redisPassword) {
            redisConfig.password = moduleConfig.redisPassword;
          }
        }

        return {
          store: await redisStore(redisConfig),
        };
      },
      isGlobal: true,
    }),
  ],
})
export class CacheProviderModule {}
