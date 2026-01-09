
import { GoogleGenAI, Type } from "@google/genai";
import { WordPair } from "../types";

export const generateAIWordPair = async (theme?: string): Promise<WordPair> => {
  // Always use a named parameter for apiKey and avoid fallbacks.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = theme 
    ? `Generate a target word and a decoy word for a social deduction game based on the theme: "${theme}". The words should be closely related but distinct.`
    : `Generate a target word and a decoy word for a social deduction game. Pick a random interesting theme. The words should be closely related but distinct.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            target: { type: Type.STRING, description: 'The main word for most players' },
            decoy: { type: Type.STRING, description: 'The similar word for the imposter' }
          },
          required: ['target', 'decoy']
        }
      }
    });

    // Access the .text property directly; do not use .text().
    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    return {
      target: result.target,
      decoy: result.decoy
    };
  } catch (error) {
    console.error("Gemini failed", error);
    // Silent fallback for game continuity
    return { target: "Sun", decoy: "Moon" };
  }
};
