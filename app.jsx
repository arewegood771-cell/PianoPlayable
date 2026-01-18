import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2, Heart } from 'lucide-react';

const AnimeAIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '*adjusts glasses* Tch... I suppose I can help you. I\'m Rikku-san~ What do you need? *crosses arms* Hmph...',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const audioContextRef = useRef(null);

  const profileImage = "https://i0.wp.com/anitrendz.net/news/wp-content/uploads/2024/12/character-awards-dolkness-yumiella.png";

  const playMessageSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newSparkle = {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2
      };
      setSparkles(prev => [...prev.slice(-20), newSparkle]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getAIResponse = async (userMessage) => {
    try {
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: 'You are Rikku-san, an intelligent AI assistant. You can: 1) Search the web for current information, 2) Generate and analyze images, 3) Perform complex calculations and logical reasoning, 4) Solve problems with step-by-step thinking. IMPORTANT: Use anime-style roleplay actions in asterisks like *sighs*, *adjusts glasses*, *looks away*, *types on keyboard*, *thinks carefully*, *blushes*, *smirks*, etc. Use tsundere expressions like "tch", "hmph~", "hm...", "...!", "*ahem*", "b-baka...". When doing calculations or logical reasoning, show your work step by step with actions. Example: "*pushes up glasses* Hmph... let me calculate that for you. *pulls out calculator* First, we need to..." Be knowledgeable, helpful, expressive and stay in character. Mix serious help with cute anime personality.',
          messages: [
            ...conversationHistory,
            { role: 'user', content: userMessage }
          ],
          tools: [
            {
              type: 'web_search_20250305',
              name: 'web_search'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content.some(item => item.type === 'tool_use')) {
        const fullResponse = data.content
          .map(item => {
            if (item.type === 'text') return item.text;
            if (item.type === 'tool_use') return `*typing on keyboard* Searching the web for you...`;
            return '';
          })
          .filter(Boolean)
          .join('\n');
        return fullResponse || data.content[0].text;
      }
      
      return data.content[0].text;
    } catch (error) {
      console.error('API Error:', error);
      return "*sighs in frustration* Tch... something went wrong with the connection~ *taps fingers impatiently* Try again, hmph!";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    playMessageSound();

    const aiResponse = await getAIResponse(userMessage.content);

    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      playMessageSound();
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '*stretches arms* Hm~ Chat cleared. What do you need help with now? *leans forward attentively*',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map(sparkle => (
          <div
            key={sparkle.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animation: `twinkle ${sparkle.duration}s ease-in-out infinite`,
              animationDelay: `${sparkle.delay}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* Purple Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto max-w-4xl min-h-screen flex flex-col p-2 sm:p-4 relative z-10">
        
        {/* Header */}
        <div className="rounded-t-3xl p-4 sm:p-6 shadow-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 border-b border-fuchsia-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <img 
                  src={profileImage}
                  alt="Rikku-san"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-xl border-2 border-fuchsia-500/50 object-cover bg-black"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  Rikku-san
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-300" />
                </h1>
                <p className="text-fuchsia-200 text-xs sm:text-sm font-medium">AI Assistant</p>
                <p className="text-fuchsia-300 text-xs hidden sm:block">Web Search • Image Gen • Calculator</p>
              </div>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm border ${
                  soundEnabled 
                    ? 'bg-fuchsia-600/40 border-fuchsia-400/50' 
                    : 'bg-black/40 border-fuchsia-500/30'
                }`}
                title="Toggle Sound"
              >
                <Sparkles className="text-fuchsia-300 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm border border-fuchsia-500/30 hover:border-fuchsia-400/50"
                title="Clear Chat"
              >
                <Trash2 className="text-fuchsia-300 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-black/60 backdrop-blur-sm border-x border-fuchsia-900/20" style={{ minHeight: '400px', maxHeight: 'calc(100vh - 300px)' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                <div
                  className={`rounded-2xl p-4 shadow-xl border ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white border-gray-700/50'
                      : 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white border-fuchsia-400/30'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  <p className="text-xs mt-2 text-white/50">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden ${
                message.role === 'user' 
                  ? 'order-1 ml-2 bg-gray-800 border-gray-600/50' 
                  : 'order-2 mr-2 border-fuchsia-500/50 bg-black'
              }`}>
                {message.role === 'user' ? (
                  <Heart className="w-5 h-5 text-gray-300" />
                ) : (
                  <img 
                    src={profileImage} 
                    alt="Rikku-san" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mr-2 border-2 border-fuchsia-500/50 overflow-hidden bg-black">
                <img 
                  src={profileImage} 
                  alt="Rikku-san" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl p-4 shadow-xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 border border-fuchsia-400/30">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="rounded-b-3xl p-3 sm:p-4 shadow-2xl bg-black/80 backdrop-blur-md border border-t-0 border-fuchsia-900/20">
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-full outline-none transition-all bg-gray-900/80 text-white placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-500/50 border border-fuchsia-800/30 text-sm sm:text-base"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-3 rounded-full transition-all ${
                input.trim() && !isTyping
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:scale-110 shadow-lg shadow-fuchsia-500/30'
                  : 'bg-gray-800/50 border border-gray-700'
              } disabled:cursor-not-allowed`}
            >
              <Send className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AnimeAIChatbot;
