import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ReasonCode } from '../../reasons/reason-code.enum';

export class CreateTicketDto {
  @ApiProperty({
    enum: ReasonCode,
    enumName: 'ReasonCode',
    example: ReasonCode.FIEVRE,
    description: 'Code from GET /reasons',
  })
  @IsEnum(ReasonCode)
  reason!: ReasonCode;
}
