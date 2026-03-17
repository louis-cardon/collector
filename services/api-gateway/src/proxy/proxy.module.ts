import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServiceProxyService } from "./service-proxy.service";

@Module({
  imports: [ConfigModule],
  providers: [ServiceProxyService],
  exports: [ServiceProxyService],
})
export class ProxyModule {}
