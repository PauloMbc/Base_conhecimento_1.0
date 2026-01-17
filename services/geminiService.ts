
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initializing GoogleGenAI with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateArcaneInsights = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma entrada de manuscrito arcano em PORTUGUÊS sobre: ${topic}. O tom deve ser poético e arcaico, mas o tema pode ser tecnologia moderna disfarçada de magia. Formate a resposta como um objeto JSON com 'title', 'category', 'content' (algumas linhas de texto), e 'metadata' (um status curto como 'Arquivado' ou 'Lua: Crescente').`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            content: { type: Type.STRING },
            metadata: { type: Type.STRING },
          },
          required: ['title', 'category', 'content', 'metadata'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return null;
  }
};
