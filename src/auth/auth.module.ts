import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@/config/database/providers.module';
import { appConfig } from '@/config/env/main.config';
import { APP_GUARD } from '@nestjs/core';
import { TokenGuard } from '@/common/guards/token.guard';
import { PoliciesGuard } from '@/common/guards/policies.guard';
import { CaslModule } from '@/config/casl/casl.module';
import { CacheProviderModule } from '@/config/cache/providers.module';

@Module({
  imports: [
    DatabaseModule,
    CaslModule,
    CacheProviderModule,
    JwtModule.registerAsync({
      useFactory: async () => {
        return {
          global: true,
          secret: appConfig.jwtSecret,
          signOptions: { expiresIn: appConfig.jwtLifetime ?? '8h' }
        };
      }
    })
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: TokenGuard
    },
    {
      provide: APP_GUARD,
      useClass: PoliciesGuard
    }
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
