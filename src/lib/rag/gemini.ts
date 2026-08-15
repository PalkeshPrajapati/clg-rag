import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

function createHashVector(text: string, dim = 768): number[] {
  const vector = new Array(dim).fill(0);
  const words = text.toLowerCase().split(/\W+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    vector[idx] += 1;
  }

  // Normalize vector to unit length so pgvector cosine distance works cleanly
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / magnitude);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!apiKey || apiKey === 'placeholder-gemini-key') {
    return createHashVector(text);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    if (response.embeddings?.[0]?.values) {
      return response.embeddings[0].values;
    }

    throw new Error('Failed to retrieve vector values from Gemini API response');
  } catch (error) {
    console.error('Error generating Gemini embedding:', error);
    return createHashVector(text);
  }
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const vec = await generateEmbedding(text);
    results.push(vec);
  }
  return results;
}
