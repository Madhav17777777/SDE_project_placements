import { useStreamStore } from '../../store/streamStore.js';

const TypingIndicator = () => {
  const typingUsers = useStreamStore((s) => s.typingUsers);
  const names = Object.values(typingUsers);

  if (names.length === 0) return <div className="h-5" />;

  return (
    <div className="h-5 truncate px-3 text-xs italic text-white/40">
      {names.slice(0, 3).join(', ')} {names.length > 1 ? 'are' : 'is'} typing…
    </div>
  );
};

export default TypingIndicator;
