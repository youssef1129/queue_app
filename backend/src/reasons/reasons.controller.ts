import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReasonDto } from './dto/reason.dto';
import { ReasonsService } from './reasons.service';

@ApiTags('reasons')
@Controller('reasons')
export class ReasonsController {
  constructor(private readonly reasonsService: ReasonsService) {}

  @Get()
  @ApiOperation({ summary: 'List consultation reasons' })
  @ApiOkResponse({ type: [ReasonDto] })
  findAll(): ReasonDto[] {
    return this.reasonsService.findAll();
  }
}
