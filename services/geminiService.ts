import { GoogleGenAI } from "@google/genai";

// Helper to safely get API Key without crashing in browser
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment process not defined");
  }
  return undefined;
};

export const generatePrizeScript = async (prizeName: string, description: string): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    return "Funcionalidade indisponível: Chave de API (Gemini) não configurada no ambiente.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Atue como um locutor de rádio energético e criativo.
      Crie um roteiro curto (chamada de 15-20 segundos) para anunciar o sorteio do seguinte prêmio na rádio:
      Prêmio: ${prizeName}
      Detalhes: ${description}
      
      O tom deve ser empolgante, urgente e convidar os ouvintes a participar. Retorne apenas o texto do roteiro.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o roteiro.";
  } catch (error) {
    console.error("Erro ao gerar roteiro:", error);
    return "Erro ao conectar com a IA para gerar o roteiro.";
  }
};

export const suggestPrizeIdeas = async (): Promise<string[]> => {
  return []; // Removed functionality as requested, kept for type safety
};