import { Module } from '@nestjs/common';
import { ReasonsController } from './reasons.controller';
import { ReasonsService } from './reasons.service';

@Module({
  controllers: [ReasonsController],
  providers: [ReasonsService],
  exports: [ReasonsService],
})
export class ReasonsModule {}
