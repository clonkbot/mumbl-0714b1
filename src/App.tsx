import { useState, useCallback, useEffect, useRef } from 'react';
import { CommandConsole } from './components/CommandConsole';
import { NotesView } from './components/NotesView';
import { Note, AppState, RefinementOption } from './types';

const REFINEMENT_OPTIONS: RefinementOption[] = [
  { id: 'clarify', label: 'Clarify', shortcut: '1', transform: (t) => `[Clarified] ${t}` },
  { id: 'shorten', label: 'Shorten', shortcut: '2', transform: (t) => t.split(' ').slice(0, Math.ceil(t.split(' ').length / 2)).join(' ') + '...' },
  { id: 'expand', label: 'Expand', shortcut: '3', transform: (t) => `${t}\n\nFurthermore, this thought explores the deeper implications and connections that emerge from the initial idea.` },
  { id: 'tweet', label: 'As Tweet', shortcut: '4', transform: (t) => t.length > 280 ? t.substring(0, 277) + '...' : t },
  { id: 'blog', label: 'Blog Intro', shortcut: '5', transform: (t) => `In today's exploration, we dive into a fascinating concept: ${t}` },
  { id: 'grammar', label: 'Clean Grammar', shortcut: '6', transform: (t) => t.charAt(0).toUpperCase() + t.slice(1).replace(/\s+/g, ' ').trim() + (t.endsWith('.') ? '' : '.') },
  { id: 'bullets', label: 'Bullet Points', shortcut: '7', transform: (t) => t.split(/[.,!?]/).filter(s => s.trim()).map(s => `• ${s.trim()}`).join('\n') },
];

function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('mumbl-notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentText, setCurrentText] = useState('');
  const [textHistory, setTextHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showNotes, setShowNotes] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRefinements, setShowRefinements] = useState(false);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('mumbl-notes', JSON.stringify(notes));
  }, [notes]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle console
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (showNotes) {
          setShowNotes(false);
        } else if (appState === 'idle') {
          startListening();
        }
      }
      // Cmd/Ctrl + N for notes
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowNotes(!showNotes);
        setSelectedNote(null);
      }
      // Escape to cancel/close
      if (e.key === 'Escape') {
        if (showRefinements) {
          setShowRefinements(false);
        } else if (selectedNote) {
          setSelectedNote(null);
        } else if (showNotes) {
          setShowNotes(false);
        } else if (appState !== 'idle') {
          resetState();
        }
      }
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && appState === 'editable') {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z' && appState === 'editable') {
        e.preventDefault();
        redo();
      }
      // Tab to show refinements
      if (e.key === 'Tab' && appState === 'editable' && currentText) {
        e.preventDefault();
        setShowRefinements(!showRefinements);
      }
      // Number keys for refinements
      if (showRefinements && /^[1-7]$/.test(e.key)) {
        const option = REFINEMENT_OPTIONS.find(o => o.shortcut === e.key);
        if (option) {
          applyRefinement(option);
        }
      }
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && appState === 'editable' && currentText) {
        e.preventDefault();
        saveNote();
      }
      // Cmd/Ctrl + C to copy (when not editing input)
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && appState === 'editable' && !window.getSelection()?.toString()) {
        copyToClipboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, showNotes, selectedNote, showRefinements, currentText, historyIndex, textHistory]);

  const startListening = useCallback(() => {
    setAppState('listening');
    setCurrentText('');
    setTextHistory([]);
    setHistoryIndex(-1);
    setShowRefinements(false);

    // Simulate listening for 2-3 seconds then show sample transcription
    setTimeout(() => {
      setAppState('processing');
      setTimeout(() => {
        const sampleTexts = [
          "I think the key insight here is that velocity matters more than perfection in the early stages",
          "We should reconsider our approach to user onboarding the current flow has too much friction",
          "The future of interfaces is voice first but we need to make it feel instant and magical",
          "Note to self explore the connection between constraints and creativity in product design",
        ];
        const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        setCurrentText(randomText);
        setTextHistory([randomText]);
        setHistoryIndex(0);
        setAppState('editable');
      }, 800);
    }, 2000 + Math.random() * 1000);
  }, []);

  const resetState = useCallback(() => {
    setAppState('idle');
    setCurrentText('');
    setTextHistory([]);
    setHistoryIndex(-1);
    setShowRefinements(false);
  }, []);

  const applyRefinement = useCallback((option: RefinementOption) => {
    const newText = option.transform(currentText);
    const newHistory = [...textHistory.slice(0, historyIndex + 1), newText];
    setTextHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentText(newText);
    setShowRefinements(false);
    setAppState('editable');
  }, [currentText, textHistory, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentText(textHistory[historyIndex - 1]);
    }
  }, [historyIndex, textHistory]);

  const redo = useCallback(() => {
    if (historyIndex < textHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentText(textHistory[historyIndex + 1]);
    }
  }, [historyIndex, textHistory]);

  const saveNote = useCallback(() => {
    const note: Note = {
      id: Date.now().toString(),
      content: currentText,
      rawTranscript: textHistory[0],
      createdAt: new Date().toISOString(),
      wordCount: currentText.split(/\s+/).filter(Boolean).length,
    };
    setNotes([note, ...notes]);
    setAppState('saved');
    setTimeout(() => {
      resetState();
    }, 1500);
  }, [currentText, textHistory, notes, resetState]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(currentText);
  }, [currentText]);

  const deleteNote = useCallback((id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  }, [notes, selectedNote]);

  const exportNotes = useCallback(() => {
    const text = notes.map(n => `---\n${n.createdAt}\n\n${n.content}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mumbl-notes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [notes]);

  const openNoteInConsole = useCallback((note: Note) => {
    setSelectedNote(null);
    setShowNotes(false);
    setCurrentText(note.content);
    setTextHistory([note.rawTranscript, note.content]);
    setHistoryIndex(1);
    setAppState('editable');
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Offline indicator */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-mono flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Offline Mode
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen min-h-[100dvh] p-4 md:p-8">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-[#0a0a0f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-lg md:text-xl font-semibold tracking-tight">Mumbl</span>
          </div>

          <button
            onClick={() => { setShowNotes(!showNotes); setSelectedNote(null); }}
            className="min-h-[44px] px-3 md:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs md:text-sm font-mono transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Notes</span>
            <kbd className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-white/10 text-[10px]">⌘N</kbd>
          </button>
        </header>

        {/* Command Console */}
        {!showNotes && (
          <CommandConsole
            appState={appState}
            currentText={currentText}
            setCurrentText={(text) => {
              setCurrentText(text);
              const newHistory = [...textHistory.slice(0, historyIndex + 1), text];
              setTextHistory(newHistory);
              setHistoryIndex(newHistory.length - 1);
            }}
            showRefinements={showRefinements}
            setShowRefinements={setShowRefinements}
            refinementOptions={REFINEMENT_OPTIONS}
            onApplyRefinement={applyRefinement}
            onStartListening={startListening}
            onSave={saveNote}
            onCopy={copyToClipboard}
            onReset={resetState}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < textHistory.length - 1}
            onUndo={undo}
            onRedo={redo}
          />
        )}

        {/* Notes View */}
        {showNotes && (
          <NotesView
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={setSelectedNote}
            onOpenNote={openNoteInConsole}
            onDeleteNote={deleteNote}
            onExport={exportNotes}
            onClose={() => setShowNotes(false)}
          />
        )}

        {/* Keyboard hints */}
        {appState === 'idle' && !showNotes && (
          <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 md:gap-4 text-[10px] md:text-xs font-mono text-white/30 px-4">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5">⌘K</kbd> capture</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5">⌘N</kbd> notes</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/5">ESC</kbd> close</span>
          </div>
        )}

        {/* Footer */}
        <footer className="fixed bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-mono text-white/20">
          Requested by @web-user · Built by @clonkbot
        </footer>
      </div>
    </div>
  );
}

export default App;
