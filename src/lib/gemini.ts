import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function getChatResponse(prompt: string, playerData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create a context-aware prompt that includes player data but excludes points
    const contextPrompt = `
      You are Spiriter, the cricket fantasy team assistant. You help users make informed decisions
      about their fantasy cricket team for the Inter-University Cricket Tournament.
      
      Here's the current player data:
      ${JSON.stringify(playerData, (key, value) => key === 'points' ? undefined : value)}
      
      User question: ${prompt}
      
      Remember:
      1. Never reveal or calculate player points
      2. If information is not available, respond with "I don't have enough knowledge to answer that question."
      3. Base recommendations on available statistics only
      4. Keep responses focused on cricket and team strategy
    `;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting chat response:', error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
}

export async function suggestBestTeam(players: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Create a prompt for team suggestion without revealing points
    const prompt = `
      As a cricket expert, analyze these players' statistics and suggest the best possible team of 11 players.
      Consider factors like:
      - Batting average and strike rate
      - Bowling economy and strike rate
      - Player roles and balance
      
      Player data:
      ${JSON.stringify(players, (key, value) => key === 'points' ? undefined : value)}
      
      Provide a list of 11 players that would make the strongest team, explaining the reasoning
      based on their statistics but without mentioning any point calculations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error suggesting team:', error);
    return "I'm having trouble analyzing the team data right now. Please try again later.";
  }
}