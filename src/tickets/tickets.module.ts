import { Module } from '@nestjs/common';
import { ReasonsModule } from '../reasons/reasons.module';
import { TicketsController } from './tickets.controller';
import { TicketsScheduler } from './tickets.scheduler';
import { TicketsService } from './tickets.service';

@Module({
  imports: [ReasonsModule],
  controllers: [TicketsController],
  providers: [TicketsScheduler, TicketsService],
})
export class TicketsModule {}
