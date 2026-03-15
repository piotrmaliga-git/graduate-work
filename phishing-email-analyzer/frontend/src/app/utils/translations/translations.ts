export const headerTranslations: Record<string, string> = {
  switchToLight: $localize`:header|Tooltip and aria label for light mode toggle@@header.switchToLight:Switch to light mode`,
  switchToDark: $localize`:header|Tooltip and aria label for dark mode toggle@@header.switchToDark:Switch to dark mode`,
  switchToEnglish: $localize`:header|Tooltip and aria label for English language switch@@header.switchToEnglish:Switch to English`,
  switchToPolish: $localize`:header|Tooltip and aria label for Polish language switch@@header.switchToPolish:Switch to Polish`,
};

export const analyzerTranslations: Record<string, string> = {
  errorEmptyEmail: $localize`:analyzer|Validation message when email body is empty@@analyzer.errorEmptyEmail:Please enter email text`,
};

export const infoTranslations: Record<string, string> = {
  gpt41Description: $localize`:info|Description of GPT-4.1 model in info card@@info.models.gpt41:Latest OpenAI model with improved reasoning`,
  gemini25ProDescription: $localize`:info|Description of Gemini 2.5 Pro model in info card@@info.models.gemini25Pro:Google's latest LLM with advanced understanding`,
  mistral7BDescription: $localize`:info|Description of Mistral 7B model in info card@@info.models.mistral7B:Open-source model from Mistral AI with 7 billion parameters`,
  llamaCloudDescription: $localize`:info|Description of Llama Cloud model in info card@@info.models.llamaCloud:Meta's LLM accessed via cloud API`,
  bielik24bitDescription: $localize`:info|Description of Bielik 2 (4-bit) model in info card@@info.models.bielik24bit:Polish language model running locally in 4-bit quantization mode`,
};

export const pipesTranslations: Record<string, string> = {
  noReason: $localize`:pipes|Fallback reason when model explanation is empty@@pipes.noReason:No additional justification.`,
};
