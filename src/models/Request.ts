import mongoose, { Schema } from 'mongoose';

// Extend the mongoose Schema type to include vector index
declare module 'mongoose' {
  interface Schema {
    index(fields: any, options?: any): this;
  }
}

export interface IRequest {
  _id: string;
  projectId: string;
  customerEndpoint: string;
  openaiEndpoint: string;
  model: string;
  prompt: string;
  promptEmbedding: number[];
  response: any;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  costUSD: number;
  createdAt: Date;
  durationMs: number;
  status: number;
}

const RequestSchema = new Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true },
  customerEndpoint: { type: String, required: true },
  openaiEndpoint: { type: String, required: true },
  model: { type: String, required: true },
  prompt: { type: String, required: true },
  promptEmbedding: { type: [Number], required: true },
  response: { type: Schema.Types.Mixed, required: true },
  promptTokens: { type: Number, required: true },
  responseTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  costUSD: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  durationMs: { type: Number, required: true },
  status: { type: Number, required: true }
});

// Create a vector search index
RequestSchema.index({ promptEmbedding: 'vector' } as any, {
  name: 'prompt_embedding_vector_index',
  vectorOptions: {
    dimensions: 384, // Dimensions for all-MiniLM-L6-v2 model
    similarity: 'cosine'
  }
});

export default mongoose.model<IRequest>('Request', RequestSchema); 