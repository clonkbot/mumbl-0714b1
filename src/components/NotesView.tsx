import { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note | null) => void;
  onOpenNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onExport: () => void;
  onClose: () => void;
}

export function NotesView({
  notes,
  selectedNote,
  onSelectNote,
  onOpenNote,
  onDeleteNote,
  onExport,
  onClose,
}: NotesViewProps) {
  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-3xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-xl md:text-2xl font-display font-semibold">Captured Thoughts</h2>
          <span className="px-2 py-1 rounded-full bg-white/10 text-xs font-mono text-white/50">
            {notes.length}
          </span>
        </div>

        {notes.length > 0 && (
          <button
            onClick={onExport}
            className="min-h-[44px] px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-mono transition-all flex items-center gap-2 self-end sm:self-auto"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export
          </button>
        )}
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
          <p className="text-base md:text-lg text-white/60 mb-2">No captures yet</p>
          <p className="text-xs md:text-sm text-white/30 font-mono">Press ⌘K to start capturing</p>
        </div>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {notes.map((note, index) => (
            <div
              key={note.id}
              className={`
                group relative p-4 md:p-5 rounded-xl border transition-all duration-200 cursor-pointer
                ${selectedNote?.id === note.id
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'bg-[#12121a]/60 border-white/10 hover:border-white/20 hover:bg-[#12121a]/80'
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
              onClick={() => onSelectNote(selectedNote?.id === note.id ? null : note)}
            >
              {/* Preview */}
              <p className="text-sm md:text-base text-white/80 leading-relaxed mb-3 line-clamp-2 pr-8">
                {note.content}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-mono text-white/40">
                <span>{formatDate(note.createdAt)}</span>
                <span className="hidden sm:inline">·</span>
                <span>{note.wordCount} words</span>
              </div>

              {/* Actions (visible when selected) */}
              {selectedNote?.id === note.id && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={(e) => { e.stopPropagation(); onOpenNote(note); }}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0f] text-xs font-mono font-medium transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit & Refine
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(note.content); }}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeLinecap="round" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}

              {/* Expand indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                  className={`w-4 h-4 text-white/30 transition-transform ${selectedNote?.id === note.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
