import mongoose from 'mongoose';

const cacheEntrySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
    index: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  promptEmbedding: {
    type: [Number],
    required: true,
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  promptTokens: {
    type: Number,
    required: true,
  },
  responseTokens: {
    type: Number,
    required: true,
  },
  totalTokens: {
    type: Number,
    required: true,
  },
  costUSD: {
    type: Number,
    required: true,
  },
  durationMs: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  }
});

// Create vector search index for prompt embeddings
cacheEntrySchema.index({ promptEmbedding: 'vector' }, {
  name: 'prompt_embedding_vector_index',
  vectorOptions: {
    dimensions: 1536, // OpenAI's embedding dimension
    similarity: 'cosine'
  }
});

const CacheEntry = mongoose.model('CacheEntry', cacheEntrySchema);

export default CacheEntry; 