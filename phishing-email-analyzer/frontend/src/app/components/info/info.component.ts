import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'info',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CardModule],
  templateUrl: './info.component.html',
})
export class InfoComponent {
  readonly models = computed(() => [
    {
      name: 'GPT-4.1',
      description: $localize`:info|Description of GPT-4.1 model in info card@@info.models.gpt41:Latest OpenAI model with improved reasoning`,
    },
    {
      name: 'Gemini 2.5 Pro',
      description: $localize`:info|Description of Gemini 2.5 Pro model in info card@@info.models.gemini25Pro:Google's latest LLM with advanced understanding`,
    },
    {
      name: 'Mistral 7B',
      description: $localize`:info|Description of Mistral 7B model in info card@@info.models.mistral7B:Open-source model from Mistral AI with 7 billion parameters`,
    },
    {
      name: 'Llama Cloud',
      description: $localize`:info|Description of Llama Cloud model in info card@@info.models.llamaCloud:Meta's LLM accessed via cloud API`,
    },
    {
      name: 'Bielik 2 (4-bit)',
      description: $localize`:info|Description of Bielik 2 (4-bit) model in info card@@info.models.bielik24bit:Polish language model running locally in 4-bit quantization mode`,
    },
  ]);
}
