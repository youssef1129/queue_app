export enum TicketStatus {
  WAITING = 'waiting',
  CALLED = 'called',
  CANCELLED = 'cancelled',
}

export interface Ticket {
  id: string;
  reason: string;
  status: TicketStatus;
}
