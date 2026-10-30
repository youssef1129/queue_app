import { Injectable } from '@nestjs/common';
import { ReasonDto } from './dto/reason.dto';
import { ReasonCode } from './reason-code.enum';

@Injectable()
export class ReasonsService {
  private readonly reasons: ReasonDto[] = [
    { code: ReasonCode.FIEVRE, label: 'Fièvre' },
    {
      code: ReasonCode.RENOUVELLEMENT_ORDONNANCE,
      label: "Renouvellement d'ordonnance",
    },
    { code: ReasonCode.DOULEUR, label: 'Douleur' },
    { code: ReasonCode.AUTRE, label: 'Autre' },
  ];

  findAll(): ReasonDto[] {
    return this.reasons;
  }

  isValid(code: ReasonCode): boolean {
    return this.reasons.some((reason) => reason.code === code);
  }
}
