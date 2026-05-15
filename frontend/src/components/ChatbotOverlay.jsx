import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../stores/authStore';

export const ChatbotOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the SCMS Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  // Simple rule-based logic for MVP
  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('timetable') || q.includes('class') || q.includes('schedule')) {
      return `You can view your full timetable in the Timetable module. For today's specific classes, check your Dashboard widgets.`;
    }
    if (q.includes('assignment') || q.includes('homework')) {
      return `Head over to the Assignments page from the sidebar to view pending coursework and submit your work.`;
    }
    if (q.includes('attendance') || q.includes('absent')) {
      return `You need at least 80% attendance to sit for finals! You can check your current percentage in the "My Attendance" section.`;
    }
    if (q.includes('result') || q.includes('gpa') || q.includes('grade')) {
      return `Results are published at the end of each semester. Check the Results tab to view your cumulative GPA and transcript.`;
    }
    if (q.includes('hello') || q.includes('hi')) {
      return `Hi ${user?.name || 'there'}! What do you need help with?`;
    }
    return `I'm still learning! For complex queries, please contact the ATI Jaffna administration at admin@atijaffna.lk.`;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setInput('');

    // Simulate network delay for bot reply
    setTimeout(() => {
      setMessages(prev => [...prev, { text: getBotResponse(userText), isBot: true }]);
    }, 600);
  };

  return (
    <>
      <button 
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${isOpen ? 'bg-slate-800 rotate-90 opacity-0 pointer-events-none' : 'bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white'}`}
      >
        <ChatBubbleLeftRightIcon className="h-7 w-7" />
      </button>

      <div className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 rounded-t-2xl flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-indigo-700 rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold">SCMS Assistant</h3>
              <p className="text-blue-100 text-xs">Online (Automated)</p>
            </div>
          </div>
          <button onClick={toggleChat} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.isBot 
                  ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm' 
                  : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 px-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-full text-sm"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5 -rotate-45 relative -top-0.5 right-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
