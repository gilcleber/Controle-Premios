import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePrizeScript = async (prizeName: string, description: string): Promise<string> => {
  try {
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
  try {
    const prompt = `
      Liste 5 ideias criativas e econômicas de prêmios para sorteios em rádio que geram alto engajamento.
      Retorne a resposta em formato JSON Array de strings, exemplo: ["Jantar Romântico", "Kit Churrasco"].
      Não use markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao sugerir ideias:", error);
    return [];
  }
};