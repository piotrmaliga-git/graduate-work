export enum AiModelId {
  GPT_4_1 = 'gpt-4.1',
  GEMINI_2_5_PRO = 'gemini-2.5-pro',
  MISTRAL_7B = 'mistral-7b',
  LLAMA_CLOUD = 'llama-cloud',
  BIELIK_2_4BIT = 'bielik-2-4bit',
}

export interface AiModelOption {
  id: AiModelId;
  name: string;
}

export const AI_MODEL_OPTIONS: AiModelOption[] = [
  { id: AiModelId.GPT_4_1, name: 'GPT-4.1' },
  { id: AiModelId.GEMINI_2_5_PRO, name: 'Gemini 2.5 Pro' },
  { id: AiModelId.MISTRAL_7B, name: 'Mistral 7B' },
  { id: AiModelId.LLAMA_CLOUD, name: 'Llama Cloud' },
  { id: AiModelId.BIELIK_2_4BIT, name: 'Bielik 2 (4-bit)' },
];
