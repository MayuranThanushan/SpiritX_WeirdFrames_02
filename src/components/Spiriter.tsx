import React, { useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { getChatResponse, suggestBestTeam } from '../lib/gemini';
import { usePlayerStore } from '../stores/playerStore';

export default function Spiriter() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot'; message: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { players } = usePlayerStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);
    setIsLoading(true);

    try {
      const response = await getChatResponse(userMessage, players);
      setChatHistory(prev => [...prev, { type: 'bot', message: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'bot', message: "I'm having trouble processing your request right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestTeam = async () => {
    setIsLoading(true);
    try {
      const suggestion = await suggestBestTeam(players);
      setChatHistory(prev => [...prev, { type: 'bot', message: suggestion }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { type: 'bot', message: "I'm having trouble suggesting a team right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Spiriter</h1>
        </div>
        <button
          onClick={handleSuggestTeam}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          Suggest Best Team
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                chat.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {chat.message}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-lg bg-white border border-gray-200">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Spiriter about players or strategy..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || !message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}