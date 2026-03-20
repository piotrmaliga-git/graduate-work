import { type AiModelId } from '../enums/enums';

export interface EmailRequest {
  email_text: string;
  model_name: string;
  sender: string;
  title: string;
}

export interface AnalysisResult {
  model: string;
  prediction: 'phishing' | 'legit';
  reason: string;
  timestamp: string;
  sender: string;
  title: string;
  response_time_ms: number;
}

export interface AiModelOption {
  id: AiModelId;
  name: string;
}
