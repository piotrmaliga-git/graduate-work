import { Component, Input, signal, ChangeDetectionStrategy, input, output } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'analyzer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './analyzer.component.html',
})
export class AnalyzerComponent {
  readonly loading = input.required<boolean>();
  readonly externalError = input<string>('', { alias: 'error' });
  readonly analyzeRequest = output<{
    emailText: string;
    selectedModel: string;
    sender: string;
  }>();

  emailText = signal<string>('');
  sender = signal<string>('');
  selectedModel = signal<string>('gpt-3.5-turbo');
  internalError = signal<string>('');

  models = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Old)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-4.1-turbo', name: 'GPT-4.1 Turbo (New)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  ];

  onAnalyze() {
    if (!this.emailText().trim()) {
      this.internalError.set('Please enter email text');
      return;
    }
    this.analyzeRequest.emit({
      emailText: this.emailText(),
      selectedModel: this.selectedModel(),
      sender: this.sender().trim(),
    });
  }

  clear() {
    this.emailText.set('');
    this.sender.set('');
    this.internalError.set('');
  }
}
