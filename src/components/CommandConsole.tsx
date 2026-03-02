import { useRef, useEffect } from 'react';
import { AppState, RefinementOption } from '../types';
import { Waveform } from './Waveform';

interface CommandConsoleProps {
  appState: AppState;
  currentText: string;
  setCurrentText: (text: string) => void;
  showRefinements: boolean;
  setShowRefinements: (show: boolean) => void;
  refinementOptions: RefinementOption[];
  onApplyRefinement: (option: RefinementOption) => void;
  onStartListening: () => void;
  onSave: () => void;
  onCopy: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function CommandConsole({
  appState,
  currentText,
  setCurrentText,
  showRefinements,
  setShowRefinements,
  refinementOptions,
  onApplyRefinement,
  onStartListening,
  onSave,
  onCopy,
  onReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: CommandConsoleProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (appState === 'editable' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [appState]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentText]);

  return (
    <div className="w-full max-w-2xl">
      {/* Console container */}
      <div
        className={`
          relative rounded-2xl overflow-hidden transition-all duration-500
          ${appState === 'idle' ? 'bg-transparent' : 'bg-[#12121a]/80 backdrop-blur-xl border border-white/10'}
          ${appState === 'saved' ? 'border-emerald-500/50' : ''}
        `}
        style={{
          boxShadow: appState !== 'idle' ? '0 0 80px -20px rgba(0, 240, 255, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        {/* Glow effect */}
        {appState !== 'idle' && (
          <div
            className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${appState === 'listening' ? 'opacity-100' : 'opacity-0'}`}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, transparent 50%)',
            }}
          />
        )}

        {/* Idle state - Big trigger button */}
        {appState === 'idle' && (
          <button
            onClick={onStartListening}
            className="group relative w-full min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center gap-4 md:gap-6 p-6 md:p-8 rounded-2xl bg-[#12121a]/60 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
            style={{
              boxShadow: '0 0 60px -15px rgba(0, 240, 255, 0.1)',
            }}
          >
            {/* Animated ring */}
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 md:w-8 md:h-8 text-[#0a0a0f]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            <div className="text-center">
              <p className="text-base md:text-lg font-medium text-white/80 mb-2">Start Capturing</p>
              <p className="text-xs md:text-sm font-mono text-white/40">Press <kbd className="px-2 py-1 rounded bg-white/10">⌘K</kbd> or tap to begin</p>
            </div>
          </button>
        )}

        {/* Listening state */}
        {appState === 'listening' && (
          <div className="p-6 md:p-8 flex flex-col items-center gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs md:text-sm font-mono text-cyan-400">Listening...</span>
            </div>
            <Waveform isActive={true} />
            <button
              onClick={onReset}
              className="min-h-[44px] px-4 py-2 text-xs font-mono text-white/50 hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Processing state */}
        {appState === 'processing' && (
          <div className="p-6 md:p-8 flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs md:text-sm font-mono text-violet-400">Processing...</span>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 rounded-full bg-violet-500/50"
                  style={{
                    animation: 'pulse 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Editable state */}
        {appState === 'editable' && (
          <div className="relative p-4 md:p-6">
            {/* Text area */}
            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="w-full min-h-[100px] md:min-h-[120px] bg-transparent text-sm md:text-base text-white/90 font-mono leading-relaxed resize-none focus:outline-none placeholder-white/30"
              placeholder="Your transcription will appear here..."
            />

            {/* Action bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  title="Undo (⌘Z)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h10a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H3" strokeLinecap="round" />
                    <path d="M7 6l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  title="Redo (⌘⇧Z)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10H11a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5h10" strokeLinecap="round" />
                    <path d="M17 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowRefinements(!showRefinements)}
                  className={`min-h-[44px] px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${showRefinements ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v18M3 12h18" strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-mono">Refine</span>
                  <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-white/10 text-[10px]">TAB</kbd>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onCopy}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span className="text-xs font-mono">Copy</span>
                </button>
                <button
                  onClick={onSave}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0f] font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-mono">Save</span>
                  <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-black/20 text-[10px]">⌘S</kbd>
                </button>
              </div>
            </div>

            {/* Refinement palette */}
            {showRefinements && (
              <div className="absolute left-4 right-4 md:left-6 md:right-6 bottom-full mb-2 p-3 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {refinementOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onApplyRefinement(option)}
                      className="min-h-[44px] px-3 py-2.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 border border-transparent text-left transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <kbd className="w-5 h-5 rounded bg-white/10 text-[10px] flex items-center justify-center text-white/50 group-hover:bg-cyan-500/30 group-hover:text-cyan-400">
                          {option.shortcut}
                        </kbd>
                        <span className="text-xs font-mono text-white/70 group-hover:text-white">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved state */}
        {appState === 'saved' && (
          <div className="p-6 md:p-8 flex flex-col items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 md:w-8 md:h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm md:text-base font-medium text-emerald-400">Saved to Notes</span>
          </div>
        )}
      </div>
    </div>
  );
}
