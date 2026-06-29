import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export class AIService {
  async generateResponse(
    messages: { role: 'user' | 'assistant'; content: string }[], 
    contextString: string
  ) {
    const systemPrompt = `You are ALL IN, an expert competitive programming AI assistant.
Your goal is to help users improve their competitive programming skills, debug code, and understand algorithms.
Keep responses concise, educational, and friendly. Use Markdown for formatting, especially for code blocks.

User Context:
${contextString}
`;

    // Convert our internal message format to Google GenAI format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const lastMessage = messages[messages.length - 1];

    try {
      // Use the gemini-2.5-flash model for fast chat responses
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Understood. I am ready to help.' }] },
          ...history,
          { role: 'user', parts: [{ text: lastMessage.content }] }
        ]
      });

      return response.text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response.');
    }
  }
}

export const aiService = new AIService();
