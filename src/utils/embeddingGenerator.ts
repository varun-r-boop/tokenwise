import { pipeline } from '@xenova/transformers';

let embeddingPipeline: any = null;

export const initializeEmbeddingPipeline = async () => {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embeddingPipeline;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const pipeline = await initializeEmbeddingPipeline();
  const result = await pipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
};

export const calculateCosineSimilarity = (vec1: number[], vec2: number[]): number => {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}; 