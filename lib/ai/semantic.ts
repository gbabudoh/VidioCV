import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

/**
 * Semantic Engine for VidioCV
 * 
 * Uses Universal Sentence Encoder to calculate semantic similarity between texts.
 */
class SemanticEngine {
  private model: use.UniversalSentenceEncoder | null = null;
  private embeddingCache = new Map<string, number[]>();

  constructor() {
    // Initial warmup if necessary
  }

  /**
   * Loads the model into memory.
   */
  async loadModel() {
    if (!this.model) {
      console.log('Loading Universal Sentence Encoder...');
      this.model = await use.load();
      console.log('Model loaded successfully.');
    }
  }

  /**
   * Generates an embedding vector for the given text.
   */
  async getEmbedding(text: string): Promise<number[]> {
    if (!this.model) await this.loadModel();
    
    const cacheKey = text.toLowerCase().trim();
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    const embeddings = await this.model!.embed([text]);
    const vector = await embeddings.array();
    const result = vector[0];
    
    // 🧹 Cleanup tensors to prevent memory leaks
    tf.dispose(embeddings);
    
    // Simple cache management
    if (this.embeddingCache.size > 500) {
      const firstKey = this.embeddingCache.keys().next().value;
      if (firstKey) this.embeddingCache.delete(firstKey);
    }
    
    this.embeddingCache.set(cacheKey, result);
    return result;
  }

  /**
   * Calculates cosine similarity between two texts.
   */
  async calculateSimilarity(textA: string, textB: string): Promise<number> {
    const vecA = await this.getEmbedding(textA);
    const vecB = await this.getEmbedding(textB);

    // Cosine similarity: (A · B) / (||A|| * ||B||)
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return Math.max(0, Math.min(1, similarity));
  }
}

export const semanticEngine = new SemanticEngine();
