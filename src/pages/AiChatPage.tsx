import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import type { ChatMessage as ChatMessageType } from '../types/chat.types';
import type { Voucher } from '../types/voucher.types';
import { getWelcomeMessage, mockAiResponse } from '../mock/handlers/chat.handler';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import VoucherDetail from '../components/store/VoucherDetail';

export default function AiChatPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHe = language === 'he';

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Initialize
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const welcome = getWelcomeMessage(isHe);
    setMessages([welcome]);

    // Check for initial prompt from URL
    const prompt = searchParams.get('q');
    if (prompt) {
      setTimeout(() => {
        handleSendMessage(prompt);
      }, 600);
    }
  }, [isHe, searchParams]);

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessageType = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    scrollToBottom();

    setIsTyping(true);
    scrollToBottom();

    const aiResponse = await mockAiResponse(text, messages, isHe);

    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
    scrollToBottom();
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleNewChat = () => {
    initialized.current = false;
    setMessages([]);
    setTimeout(() => {
      const welcome = getWelcomeMessage(isHe);
      setMessages([welcome]);
    }, 100);
  };

  const hasConversation = messages.length > 1;

  return (
    <div className="min-h-screen bg-white flex flex-col animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-border transition-colors"
          >
            <span
              className="material-symbols-outlined text-text-primary"
              style={{ fontSize: '20px' }}
            >
              arrow_back
            </span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: '16px' }}
              >
                auto_awesome
              </span>
            </div>
            <span className="text-sm font-bold text-text-primary">Nexus AI</span>
          </div>

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="w-9 h-9 rounded-full bg-surface flex items-center justify-center hover:bg-border transition-colors"
          >
            <span
              className="material-symbols-outlined text-text-primary"
              style={{ fontSize: '20px' }}
            >
              edit_square
            </span>
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {/* Empty state / Welcome (when only welcome message) */}
        {!hasConversation && messages.length === 1 && (
          <div className="flex flex-col items-center justify-center px-6 pt-12 pb-6">
            {/* AI avatar */}
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontSize: '32px' }}
              >
                auto_awesome
              </span>
            </div>

            <h1 className="text-lg font-bold text-text-primary mb-2">
              {isHe ? 'מה נמצא היום?' : "What can I find for you?"}
            </h1>
            <p className="text-sm text-text-muted text-center max-w-[280px] mb-8">
              {isHe
                ? 'ספר לי מה אתה מחפש ואני אמצא לך את ההטבה המושלמת'
                : "Tell me what you're looking for and I'll find the perfect deal"}
            </p>

            {/* Suggestion cards */}
            <div className="w-full grid grid-cols-2 gap-2.5 max-w-sm">
              {(isHe
                ? [
                    { text: 'מתנה ליום הולדת', icon: '🎂' },
                    { text: 'בילוי זוגי בסופש', icon: '💑' },
                    { text: 'ההנחה הכי שווה', icon: '🔥' },
                    { text: 'קפה טוב', icon: '☕' },
                  ]
                : [
                    { text: 'Birthday gift', icon: '🎂' },
                    { text: 'Date night', icon: '💑' },
                    { text: 'Best discount', icon: '🔥' },
                    { text: 'Good coffee', icon: '☕' },
                  ]
              ).map(({ text, icon }) => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-white hover:bg-surface hover:border-primary/20 active:scale-[0.97] transition-all text-start"
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs font-medium text-text-secondary leading-snug">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation messages (skip welcome when showing centered UI) */}
        {hasConversation && (
          <div className="py-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onSelectProduct={setSelectedVoucher}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
          </div>
        )}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isTyping}
      />

      {/* Voucher detail */}
      {selectedVoucher && (
        <VoucherDetail voucher={selectedVoucher} onClose={() => setSelectedVoucher(null)} />
      )}
    </div>
  );
}
