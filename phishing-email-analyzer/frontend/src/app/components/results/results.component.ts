import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../../models/prediction';

@Component({
  selector: 'results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './results.component.html',
})
export class ResultsComponent {
  result = input<AnalysisResult | null>(null);
}
