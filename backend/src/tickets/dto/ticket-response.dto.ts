import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../ticket.types';

export class TicketResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiProperty({ example: 'fievre' })
  reason!: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.WAITING })
  status!: TicketStatus;

  @ApiProperty({
    example: 3,
    description: '1 = next to be called, 0 when not waiting',
  })
  position!: number;

  @ApiProperty({
    example: 15,
    description: 'Position x average consultation time',
  })
  estimatedWaitMinutes!: number;
}
