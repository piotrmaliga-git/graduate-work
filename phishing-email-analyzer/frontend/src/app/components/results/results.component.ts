import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../../models/prediction';
import { FormatReasonPipe } from '../../pipes/format-reason.pipe';
import { FormatTimePipe } from '../../pipes/format-time.pipe';

@Component({
  selector: 'results',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormatReasonPipe, FormatTimePipe],
  templateUrl: './results.component.html',
})
export class ResultsComponent {
  result = input<AnalysisResult | null>(null);
}
