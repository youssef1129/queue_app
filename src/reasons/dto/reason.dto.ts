import { ApiProperty } from '@nestjs/swagger';

export class ReasonDto {
  @ApiProperty({ example: 'fievre' })
  code!: string;

  @ApiProperty({ example: 'Fièvre' })
  label!: string;
}
