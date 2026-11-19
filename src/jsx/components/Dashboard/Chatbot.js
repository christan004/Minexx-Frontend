import React, { useState } from 'react';
import { Send, MessageCircle, X, MinusCircle } from 'lucide-react';
// import { OPENAI_API_KEY } from '../../../config'
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello ! Your mineral trader assistant here, how can i help you today", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const OPENAI_API_KEY=process.env.REACT_APP_OPENAI_API_KEY;
  const generateResponse = async (userMessage) => {
    try {
      const response = await fetch('https://minexxapi-db-p7n5ing2cq-uc.a.run.app/openai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a specialized minerals and mining information assistant. Focus on providing accurate information about:
              - 3Ts (Tin, Tungsten, Tantalum)
              - Gold and precious metals
              - Mining processes and regulations
              - Mineral trading and markets
              - Responsible sourcing and conflict minerals
              
              Keep responses focused on these topics. If asked about unrelated topics, politely redirect to mineral-related discussions. Provide accurate, up-to-date information about mineral markets, mining operations, and regulations.`
            },
            ...messages.map(msg => ({
              role: msg.isBot ? 'assistant' : 'user',
              content: msg.text
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate response');
      }
  
      const data = await response.json();
      // Handle the response structure from our fixed backend
      if (data.success && data.data && data.data.choices && data.data.choices.length > 0) {
        return data.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  };
  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage = input.trim();
      setInput('');
      setIsLoading(true);
      setMessages(prev => [...prev, { text: userMessage, isBot: false }]);

      try {
        const response = await generateResponse(userMessage);
        setMessages(prev => [...prev, { text: response, isBot: true }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          text: "Sorry, I'm having trouble connecting. Please try again.", 
          isBot: true 
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const chatbotStyle = {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: isOpen ? '350px' : 'auto',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    height: isOpen ? (isMinimized ? '50px' : '400px') : 'auto',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  };

  const messageContainerStyle = {
    height: '400px',
    overflowY: 'auto',
    backgroundColor: '#1E1E1E',
  };

  // Chat icon button when closed
  if (!isOpen) {
    return (
      <button 
        className="btn btn-primary rounded-circle p-3 position-fixed"
        style={{ right: '20px', bottom: '20px', width: '60px', height: '60px' }}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div style={chatbotStyle} className="card">
      {/* Header */}
      <div className="card-header bg-primary d-flex justify-content-between align-items-center py-2">
        <div className="d-flex align-items-center">
          <span className="badge bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></span>
          <h6 className="mb-0 text-white">MinexxBot</h6>
        </div>
        <div>
          <button 
            className="btn btn-link btn-sm text-white p-0 me-2"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <MinusCircle size={16} />
          </button>
          <button 
            className="btn btn-link btn-sm text-white p-0"
            onClick={() => setIsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="card-body p-3" style={messageContainerStyle}>
            {messages.map((message, index) => (
              <div key={index} className={`d-flex mb-3 ${message.isBot ? 'justify-content-start' : 'justify-content-end'}`}>
                <div className={`p-2 rounded ${
                  message.isBot 
                    ? 'bg-dark text-white' 
                    : 'bg-primary text-white'
                }`} style={{ maxWidth: '80%' }}>
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="bg-dark text-white p-2 rounded">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="card-footer bg-dark border-top">
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-dark text-white border-dark"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about minerals..."
                disabled={isLoading}
              />
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;