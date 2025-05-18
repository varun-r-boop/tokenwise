import mongoose, {  Schema } from 'mongoose';

export interface IRequest  {
  _id: string;
  projectId: string;
  customerEndpoint: string;
  openaiEndpoint: string;
  model: string;
  prompt: string;
  response: any;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  costUSD: number;
  createdAt: Date;
  durationMs: number;
  status: number;
}

const RequestSchema: Schema = new Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true },
  customerEndpoint: { type: String, required: true },
  openaiEndpoint: { type: String, required: true },
  model: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: Schema.Types.Mixed, required: true },
  promptTokens: { type: Number, required: true },
  responseTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  costUSD: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  durationMs: { type: Number, required: true },
  status: { type: Number, required: true }
});

export default mongoose.model<IRequest>('Request', RequestSchema); 