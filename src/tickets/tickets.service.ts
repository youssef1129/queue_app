import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { ReasonsService } from '../reasons/reasons.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { Ticket, TicketStatus } from './ticket.types';

@Injectable()
export class TicketsService {
  private readonly tickets: Ticket[] = [];
  private readonly avgConsultationMinutes: number;

  constructor(
    private readonly reasonsService: ReasonsService,
    config: ConfigService,
  ) {
    this.avgConsultationMinutes = Number(
      config.get('AVG_CONSULTATION_MINUTES', 5),
    );
    this.seedFakePatients();
  }

  findAll(): TicketResponseDto[] {
    return this.tickets.map((ticket) => this.toResponse(ticket));
  }

  create(dto: CreateTicketDto): TicketResponseDto {
    if (!this.reasonsService.isValid(dto.reason)) {
      throw new BadRequestException('Unknown consultation reason');
    }
    const ticket: Ticket = {
      id: randomUUID(),
      reason: dto.reason,
      status: TicketStatus.WAITING,
    };
    this.tickets.push(ticket);
    return this.toResponse(ticket);
  }

  findOne(id: string): TicketResponseDto {
    return this.toResponse(this.getOrThrow(id));
  }

  cancel(id: string): TicketResponseDto {
    const ticket = this.getOrThrow(id);
    if (ticket.status !== TicketStatus.WAITING) {
      throw new ConflictException(`Ticket already ${ticket.status}`);
    }
    ticket.status = TicketStatus.CANCELLED;
    return this.toResponse(ticket);
  }

  /** Called by the scheduler: first waiting ticket becomes "called". */
  advanceQueue(): void {
    const next = this.tickets.find((t) => t.status === TicketStatus.WAITING);
    if (next) {
      next.status = TicketStatus.CALLED;
    }
  }

  private getOrThrow(id: string): Ticket {
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  private computePosition(ticket: Ticket): number {
    if (ticket.status !== TicketStatus.WAITING) {
      return 0;
    }
    const waiting = this.tickets.filter(
      (t) => t.status === TicketStatus.WAITING,
    );
    return waiting.indexOf(ticket) + 1;
  }

  private toResponse(ticket: Ticket): TicketResponseDto {
    const position = this.computePosition(ticket);
    return {
      id: ticket.id,
      reason: ticket.reason,
      status: ticket.status,
      position,
      estimatedWaitMinutes: position * this.avgConsultationMinutes,
    };
  }

  private seedFakePatients(): void {
    for (let i = 1; i <= 3; i++) {
      this.tickets.push({
        id: `seed-${i}`,
        reason: 'autre',
        status: TicketStatus.WAITING,
      });
    }
  }
}
