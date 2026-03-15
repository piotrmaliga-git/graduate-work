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
