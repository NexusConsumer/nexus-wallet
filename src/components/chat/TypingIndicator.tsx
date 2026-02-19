export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontSize: '16px' }}
        >
          auto_awesome
        </span>
      </div>
      <div className="bg-surface rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-text-muted/40 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-text-muted/40 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-text-muted/40 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
