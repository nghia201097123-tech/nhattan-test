import { Module } from "@nestjs/common";
import { BufferCacheService } from "./buffer-cache.service";

@Module({
  controllers: [],
  providers: [BufferCacheService],
  exports: [BufferCacheService],
})
export class BufferCacheModule {}
