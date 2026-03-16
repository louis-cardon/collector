import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [ConfigModule],
  providers: [JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
