import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketsService } from './tickets.service';
import { Observable } from 'rxjs';
import { TicketStatus } from './ticket.types';

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tickets' })
  @ApiOkResponse({ type: [TicketResponseDto] })
  findAll(): TicketResponseDto[] {
    return this.ticketsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Join the queue' })
  @ApiCreatedResponse({ type: TicketResponseDto })
  @ApiBadRequestResponse({ description: 'Reason missing or unknown' })
  create(@Body() dto: CreateTicketDto): TicketResponseDto {
    return this.ticketsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket status, position and estimated wait' })
  @ApiOkResponse({ type: TicketResponseDto })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  findOne(@Param('id') id: string): TicketResponseDto {
    return this.ticketsService.findOne(id);
  }

  @Sse(':id/stream')
  @ApiOperation({ summary: 'Stream ticket status and queue position updates' })
  @ApiProduces('text/event-stream')
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  stream(@Param('id') id: string): Observable<MessageEvent> {
    const updates = this.ticketsService.stream(id);
    return new Observable<MessageEvent>((subscriber) => {
      const heartbeat = setInterval(
        () => subscriber.next({ comment: 'heartbeat' }),
        15_000,
      );
      const subscription = updates.subscribe({
        next: (data) => {
          subscriber.next({ data });
          if (data.status !== TicketStatus.WAITING) subscriber.complete();
        },
        error: (error: unknown) => subscriber.error(error),
        complete: () => subscriber.complete(),
      });
      return () => {
        clearInterval(heartbeat);
        subscription.unsubscribe();
      };
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Leave the queue' })
  @ApiOkResponse({ type: TicketResponseDto })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiConflictResponse({ description: 'Ticket already called or cancelled' })
  cancel(@Param('id') id: string): TicketResponseDto {
    return this.ticketsService.cancel(id);
  }
}
