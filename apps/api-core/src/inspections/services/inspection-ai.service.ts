import { Injectable } from '@nestjs/common';

@Injectable()
export class InspectionAiService {
  async analyzeInspectionMedia(input: { storageUrl?: string | null; viewpoint?: string | null }) {
    return {
      damageDetected: false,
      comparisonRequired: false,
      confidence: 0,
      viewpoint: input.viewpoint ?? null,
      source: 'placeholder',
    };
  }
}
