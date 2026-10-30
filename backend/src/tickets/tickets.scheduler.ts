import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TicketsService } from './tickets.service';

@Injectable()
export class TicketsScheduler {
  constructor(private readonly ticketsService: TicketsService) {}

  @Interval(20_000)
  advance(): void {
    this.ticketsService.advanceQueue();
  }
}
