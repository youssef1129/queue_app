import { ApiProperty } from '@nestjs/swagger';
import { ReasonCode } from '../reason-code.enum';

export class ReasonDto {
  @ApiProperty({ enum: ReasonCode, enumName: 'ReasonCode' })
  code!: ReasonCode;

  @ApiProperty({ example: 'Fièvre' })
  label!: string;
}
