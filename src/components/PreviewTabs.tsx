import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Layers, ScanEye, Bookmark } from 'lucide-react';
import { UIPreview } from './UIPreview';
import { ToneScalePanel } from './ToneScalePanel';
import { ContrastInspector } from './ContrastInspector';
import { SavedPalettes } from './SavedPalettes';
import { useStore } from '../store';

const TABS = [
  { id: 'ui', label: 'UI 미리보기', icon: Layout },
  { id: 'tone', label: '톤 스케일', icon: Layers },
  { id: 'contrast', label: '대비 검사', icon: ScanEye },
  { id: 'saved', label: '저장됨', icon: Bookmark },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function PreviewTabs() {
  const [tab, setTab] = useState<TabId>('ui');
  const showInspector = useStore((s) => s.showInspector);
  const toggleInspector = useStore((s) => s.toggleInspector);
  const savedCount = useStore((s) => s.saved.length);

  useEffect(() => {
    if (showInspector) {
      setTab('contrast');
      toggleInspector();
    }
  }, [showInspector, toggleInspector]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-1 bg-bg-soft border border-border rounded-lg p-0.5 w-fit mb-5 max-w-full overflow-x-auto hide-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              tab === id ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
            }`}
          >
            {tab === id && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 bg-bg-elev rounded-md border border-border shadow-soft"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="size-3.5" />
              {label}
              {id === 'saved' && savedCount > 0 && (
                <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-bg-soft text-fg-muted">
                  {savedCount}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {tab === 'ui' && <UIPreview />}
        {tab === 'tone' && <ToneScalePanel />}
        {tab === 'contrast' && <ContrastInspector />}
        {tab === 'saved' && <SavedPalettes />}
      </motion.div>
    </div>
  );
}
