export interface OpenAIBaseRequest {
  max_tokens?: number;
  model: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  response_format?: any;
}

export interface ChatCompletionBase {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIChatCompletionRequest extends OpenAIBaseRequest {
  messages: ChatCompletionBase[];
  presence_penalty: number;
}
