import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketsService } from './tickets.service';

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

  @Delete(':id')
  @ApiOperation({ summary: 'Leave the queue' })
  @ApiOkResponse({ type: TicketResponseDto })
  @ApiNotFoundResponse({ description: 'Ticket not found' })
  @ApiConflictResponse({ description: 'Ticket already called or cancelled' })
  cancel(@Param('id') id: string): TicketResponseDto {
    return this.ticketsService.cancel(id);
  }
}
