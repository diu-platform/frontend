import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
  context: {
    activeSimulation: string;
    wavelength: number;
    slitSeparation: number;
    observerMode: boolean;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Why does the pattern change when I observe?",
  "What is wave-particle duality?",
  "How does wavelength affect the pattern?",
  "What happens in real experiments?",
];

function AIAssistant({ onClose, context }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I'm your AI physics tutor. I can see you're exploring the **Double-Slit Experiment**.

Current settings:
- Wavelength: ${context.wavelength} nm
- Slit separation: ${context.slitSeparation.toFixed(2)} mm
- Observer mode: ${context.observerMode ? 'ON' : 'OFF'}

What would you like to learn about? Feel free to ask anything about quantum physics!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call backend API
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/v1/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          context: JSON.stringify(context),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response if API is not available
        const fallbackMessage: Message = {
          role: 'assistant',
          content: getLocalResponse(input, context),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      }
    } catch (error) {
      // Fallback for when backend is not running
      const fallbackMessage: Message = {
        role: 'assistant',
        content: getLocalResponse(input, context),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <aside className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-blue-400" />
          <span className="font-semibold">AI Physics Tutor</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div 
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: formatMessage(message.content) 
                }}
              />
              <div className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500 mb-2">Suggested questions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestion(question)}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about quantum physics..."
            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Format markdown-like text
function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}

// Local fallback responses
function getLocalResponse(question: string, context: any): string {
  const q = question.toLowerCase();
  
  if (q.includes('observe') || q.includes('pattern change')) {
    return `Great question! When you toggle **Observer Mode**, you're simulating what happens when we try to measure which slit the particle passes through.

**Without observation (Wave mode):**
The particle exists in a superposition, passing through "both slits at once" and creating an interference pattern.

**With observation (Particle mode):**
The act of measurement "collapses" the wave function, forcing the particle to go through one slit or the other. The interference pattern disappears!

This is the core mystery of quantum mechanics - the observer affects the outcome. Try toggling the observer mode to see this in action! 👁️`;
  }
  
  if (q.includes('wave') && q.includes('particle') || q.includes('duality')) {
    return `**Wave-particle duality** is one of the most mind-bending concepts in physics!

It means quantum objects (like electrons and photons) aren't simply "particles" or "waves" - they're something entirely new that can behave as either, depending on how we observe them.

In your current simulation:
- **Wave behavior**: The interference pattern you see
- **Particle behavior**: Turn on Observer Mode to see individual "hits"

This duality was first demonstrated by the double-slit experiment you're exploring right now! 🌊⚛️`;
  }
  
  if (q.includes('wavelength')) {
    return `**Wavelength affects the interference pattern spacing!**

Currently you have λ = ${context.wavelength} nm

The fringe spacing is proportional to wavelength:
- **Shorter wavelength** (violet/blue) → narrower fringes
- **Longer wavelength** (red) → wider fringes

Try moving the wavelength slider and watch how the bright/dark bands change!

The formula: Δy = λL/d
Where L is screen distance and d is slit separation (${context.slitSeparation.toFixed(2)} mm)`;
  }
  
  return `That's an interesting question about "${question}"! 

I'm currently running in offline mode, but I can still help you understand the basics. 

Try experimenting with the simulation - adjust the parameters and observe what changes. The best way to learn quantum physics is by playing with it!

Would you like to know more about:
- Wave-particle duality
- The observer effect
- How wavelength affects interference`;
}

export default AIAssistant;
