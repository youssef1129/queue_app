import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReasonsService } from '../reasons/reasons.service';
import { ReasonCode } from '../reasons/reason-code.enum';
import { TicketStatus } from './ticket.types';
import { TicketsService } from './tickets.service';

jest.mock('@nestjs/config', () => ({
  ConfigService: class {
    constructor(private readonly values: Record<string, any> = {}) {}

    get<T = any>(key: string, defaultValue?: T): T | undefined {
      return (this.values[key] ?? defaultValue) as T;
    }
  },
}));

describe('TicketsService', () => {
  let service: TicketsService;

  beforeEach(() => {
    service = new TicketsService(
      new ReasonsService(),
      new ConfigService({ AVG_CONSULTATION_MINUTES: 5 }),
    );
  });

  it('puts a new ticket behind the 3 seed patients with the right wait', () => {
    const ticket = service.create({ reason: ReasonCode.FIEVRE });

    expect(ticket.status).toBe(TicketStatus.WAITING);
    expect(ticket.position).toBe(4);
    expect(ticket.estimatedWaitMinutes).toBe(20);
  });

  it('moves the ticket up on each advance and calls it when it is first', () => {
    const { id } = service.create({ reason: ReasonCode.DOULEUR });

    service.advanceQueue();
    expect(service.findOne(id).position).toBe(3);

    service.advanceQueue();
    service.advanceQueue();
    expect(service.findOne(id).position).toBe(1);

    service.advanceQueue();
    const called = service.findOne(id);
    expect(called.status).toBe(TicketStatus.CALLED);
    expect(called.position).toBe(0);
  });

  it('emits queue changes and completes a stream when the ticket is called', () => {
    const { id } = service.create({ reason: ReasonCode.DOULEUR });
    const updates: string[] = [];
    let completed = false;
    service.stream(id).subscribe({
      next: (ticket) => updates.push(ticket.status),
      complete: () => (completed = true),
    });

    service.advanceQueue();
    expect(updates).toHaveLength(2);
    expect(completed).toBe(false);

    service.advanceQueue();
    service.advanceQueue();
    service.advanceQueue();
    expect(updates.at(-1)).toBe(TicketStatus.CALLED);
    expect(completed).toBe(true);
  });

  it('lets a waiting ticket leave and moves the others up', () => {
    const first = service.create({ reason: ReasonCode.AUTRE });
    const second = service.create({ reason: ReasonCode.AUTRE });

    service.cancel(first.id);

    expect(service.findOne(first.id).status).toBe(TicketStatus.CANCELLED);
    expect(service.findOne(second.id).position).toBe(4);
  });

  it('throws a 409 when cancelling a called or cancelled ticket', () => {
    const { id } = service.create({ reason: ReasonCode.FIEVRE });
    service.cancel(id);
    expect(() => service.cancel(id)).toThrow(ConflictException);

    const other = service.create({ reason: ReasonCode.FIEVRE });
    for (let i = 0; i < 5; i++) service.advanceQueue();
    expect(service.findOne(other.id).status).toBe(TicketStatus.CALLED);
    expect(() => service.cancel(other.id)).toThrow(ConflictException);
  });

  it('throws a 404 for an unknown ticket', () => {
    expect(() => service.findOne('nope')).toThrow(NotFoundException);
  });
});
