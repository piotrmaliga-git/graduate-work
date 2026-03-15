import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

type ModelInfo = {
  name: string;
  description: string;
};

@Component({
  selector: 'info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule],
  templateUrl: './info.component.html',
})
export class InfoComponent {
  readonly models: ModelInfo[] = [
    { name: 'GPT-4.1', description: 'Latest OpenAI model with improved reasoning' },
    {
      name: 'Gemini 2.5 Pro',
      description: "Google's latest LLM with advanced understanding",
    },
    {
      name: 'Mistral 7B',
      description: 'Open-source model from Mistral AI with 7 billion parameters',
    },
    { name: 'Llama Cloud', description: "Meta's LLM accessed via cloud API" },
    {
      name: 'Bielik 2 (4-bit)',
      description: 'Polish language model running locally in 4-bit quantization mode',
    },
  ];
}
