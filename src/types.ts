export type AppState = 'idle' | 'listening' | 'processing' | 'editable' | 'refining' | 'saved';

export interface Note {
  id: string;
  content: string;
  rawTranscript: string;
  createdAt: string;
  wordCount: number;
  tags?: string[];
}

export interface RefinementOption {
  id: string;
  label: string;
  shortcut: string;
  transform: (text: string) => string;
}
