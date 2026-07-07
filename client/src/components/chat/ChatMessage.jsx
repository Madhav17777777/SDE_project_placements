const ChatMessage = ({ message }) => (
  <div className="break-words px-3 py-1 text-sm leading-relaxed hover:bg-white/[0.03]">
    <span className="font-semibold text-accent-glow">{message.sender?.username}: </span>
    <span className="text-white/90">{message.content}</span>
  </div>
);

export default ChatMessage;
