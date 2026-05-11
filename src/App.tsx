import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { PaletteStrip } from './components/PaletteStrip';
import { PreviewTabs } from './components/PreviewTabs';
import { ExportDialog } from './components/ExportDialog';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { Toaster } from './components/Toast';
import { useShortcuts } from './hooks/useShortcuts';
import { useStore } from './store';

function App() {
  const [exportOpen, setExportOpen] = useState(false);
  const loadFromHash = useStore((s) => s.loadFromHash);

  useShortcuts();

  useEffect(() => {
    if (window.location.hash) {
      loadFromHash(window.location.hash);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [loadFromHash]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenExport={() => setExportOpen(true)} />
      <Toolbar />
      <PaletteStrip />
      <main className="flex-1 bg-bg">
        <PreviewTabs />
      </main>
      <footer className="border-t border-border bg-bg-elev">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-[11px] text-fg-subtle">
          <div>
            Crafted with OKLCH color science. Press <kbd className="kbd">?</kbd> for shortcuts.
          </div>
          <div className="font-mono">Chroma Lab · v0.1</div>
        </div>
      </footer>
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <ShortcutsHelp />
      <Toaster />
    </div>
  );
}

export default App;
