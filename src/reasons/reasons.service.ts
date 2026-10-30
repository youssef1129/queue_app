import { Injectable } from '@nestjs/common';
import { ReasonDto } from './dto/reason.dto';

@Injectable()
export class ReasonsService {
  private readonly reasons: ReasonDto[] = [
    { code: 'fievre', label: 'Fièvre' },
    { code: 'renouvellement-ordonnance', label: "Renouvellement d'ordonnance" },
    { code: 'douleur', label: 'Douleur' },
    { code: 'autre', label: 'Autre' },
  ];

  findAll(): ReasonDto[] {
    return this.reasons;
  }

  isValid(code: string): boolean {
    return this.reasons.some((reason) => reason.code === code);
  }
}
