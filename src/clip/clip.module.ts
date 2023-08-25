import { Module } from '@nestjs/common';
import { ClipService } from './clip.service';
import { ClipController } from './clip.controller';

@Module({
  controllers: [ClipController],
  providers: [ClipService],
})
export class ClipModule {}
