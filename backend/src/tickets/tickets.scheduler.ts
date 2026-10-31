import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TicketsService } from './tickets.service';

export const QUEUE_ADVANCE_INTERVAL_MS = 20_000;

@Injectable()
export class TicketsScheduler {
  constructor(private readonly ticketsService: TicketsService) {}

  @Interval(QUEUE_ADVANCE_INTERVAL_MS)
  advance(): void {
    this.ticketsService.advanceQueue();
  }
}
