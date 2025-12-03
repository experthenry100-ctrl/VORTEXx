import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateProductAdvice = async (
  query: string,
  currentProduct?: Product
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Assistant is offline (Missing API Key).";

  const productContext = currentProduct
    ? `The user is currently looking at: ${currentProduct.name}. 
       Price: $${currentProduct.price}. 
       Specs: ${currentProduct.specs.join(', ')}. 
       Description: ${currentProduct.description}.`
    : "The user is browsing the main store.";

  const prompt = `
    You are 'Vortex AI', a helpful, witty, and knowledgeable gaming hardware expert assistant for an online store named Vortex.
    
    Context:
    ${productContext}
    
    User Query: "${query}"
    
    Task: Answer the user's question. If they ask about the product, explain why it's good for gaming. 
    Keep it concise (under 3 sentences) and use gaming terminology where appropriate. 
    Be enthusiastic but professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I'm having trouble connecting to the Vortex mainframe.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection interference detected. Please try again.";
  }
};