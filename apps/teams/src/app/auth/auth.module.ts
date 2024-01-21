import {Global, Module} from "@nestjs/common";
import {AuthRedisService} from "./services/auth.redis.service";
import {CacheModule, CacheModuleAsyncOptions} from "@nestjs/cache-manager";
import {redisStore} from "cache-manager-redis-store";


export const REDIS_OPTIONS: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [],
  useFactory: async () => {
    const store = await redisStore({
      socket: {
        host: '127.0.0.1',
        port: parseInt('6379')
      },
      database: 5
    });
    return {
      store: () => store,
    };
  },
  inject: [],
};

@Global()
@Module({
  imports: [
    CacheModule.registerAsync(REDIS_OPTIONS),
  ],
  controllers: [],
  exports: [AuthRedisService],
  providers: [AuthRedisService],
})


export class AuthModule {
}
