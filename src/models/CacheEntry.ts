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
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  }
}, {
  collection: 'cacheEntry'
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