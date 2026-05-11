import { useState } from 'react';
import { Sun, Moon, Save, Share2, Download, Keyboard } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../hooks/useToast';

type Props = {
  onOpenExport: () => void;
};

export function Header({ onOpenExport }: Props) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleShortcuts = useStore((s) => s.toggleShortcuts);
  const savePalette = useStore((s) => s.savePalette);
  const exportShareUrl = useStore((s) => s.exportShareUrl);
  const paletteName = useStore((s) => s.paletteName);
  const setPaletteName = useStore((s) => s.setPaletteName);
  const push = useToast((s) => s.push);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(paletteName);

  function commit() {
    setEditing(false);
    setPaletteName(draft.trim() || 'Untitled palette');
  }

  function copyShare() {
    const url = exportShareUrl();
    navigator.clipboard.writeText(url).then(() => push('Share link copied', 'success'));
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg/70 border-b border-border">
      <div className="max-w-screen-2xl mx-auto h-14 px-4 sm:px-6 flex items-center gap-4">
        <a href="#" className="flex items-center gap-2 font-display font-semibold text-fg shrink-0">
          <span className="relative inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-400 shadow-glow">
            <span className="size-2.5 rounded-full bg-bg-elev" />
          </span>
          <span className="text-base tracking-tight">Chroma Lab</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-soft text-fg-subtle border border-border">
            v0.1
          </span>
        </a>

        <div className="hidden md:flex flex-1 items-center justify-center min-w-0">
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') { setDraft(paletteName); setEditing(false); }
              }}
              className="bg-bg-soft border border-border rounded-md px-3 py-1 text-sm font-medium text-fg w-72 focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          ) : (
            <button
              onClick={() => { setDraft(paletteName); setEditing(true); }}
              className="text-sm font-medium text-fg-muted hover:text-fg transition-colors px-3 py-1 rounded-md hover:bg-bg-soft truncate max-w-[420px]"
              title="Rename palette"
            >
              {paletteName}
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            className="btn-ghost"
            onClick={() => { savePalette(); push('Palette saved', 'success'); }}
            title="Save palette (⌘S)"
          >
            <Save className="size-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button className="btn-ghost" onClick={copyShare} title="Copy share link (C)">
            <Share2 className="size-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="btn-primary" onClick={onOpenExport} title="Export">
            <Download className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button className="btn-ghost size-9 !p-0" onClick={toggleShortcuts} title="Keyboard shortcuts (?)">
            <Keyboard className="size-4" />
          </button>
          <button
            className="btn-ghost size-9 !p-0"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (T)`}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
