import { useEffect, useRef, useState } from 'react';
import { IoSend, IoHappyOutline } from 'react-icons/io5';
import { useStreamChat } from '../../hooks/useSocket.js';
import { useStreamStore } from '../../store/streamStore.js';
import { useAuth } from '../../hooks/useAuth.js';
import ChatMessage from './ChatMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import Button from '../common/Button.jsx';

const QUICK_EMOJIS = ['😀', '😂', '😍', '🔥', '👏', '😢', '😮', '🎉', '💜', '👍'];

const ChatBox = ({ streamId }) => {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const { isAuthenticated } = useAuth();
  const { sendMessage, sendTyping } = useStreamChat(streamId);
  const messages = useStreamStore((s) => s.messages);
  const scrollRef = useRef(null);

  // Auto-scroll to the newest message whenever the list grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
    setShowEmojis(false);
  };

  return (
    <div className="glass-card flex h-[520px] w-full flex-col overflow-hidden lg:w-80">
      <div className="border-b border-white/10 px-4 py-3 font-semibold">Stream Chat</div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-2">
        {messages.length === 0 ? (
          <p className="px-3 text-sm text-white/40">No messages yet — say hello!</p>
        ) : (
          messages.map((message) => <ChatMessage key={message._id} message={message} />)
        )}
      </div>

      <TypingIndicator />

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="relative border-t border-white/10 p-2">
          {showEmojis && (
            <div className="glass-card absolute bottom-14 left-2 grid grid-cols-5 gap-1 p-2">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setText((t) => t + emoji)}
                  className="rounded-lg p-1.5 text-lg hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmojis((v) => !v)}
              className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <IoHappyOutline size={20} />
            </button>
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                sendTyping();
              }}
              placeholder="Send a message"
              maxLength={500}
              className="input-field flex-1 py-2 text-sm"
            />
            <Button type="submit" variant="primary" className="px-3 py-2">
              <IoSend size={16} />
            </Button>
          </div>
        </form>
      ) : (
        <div className="border-t border-white/10 p-3 text-center text-sm text-white/40">Log in to chat</div>
      )}
    </div>
  );
};

export default ChatBox;
