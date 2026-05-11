import { useEffect } from 'react';
import { useStore } from '../store';
import { useToast } from './useToast';

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || t.isContentEditable;
}

export function useShortcuts() {
  const shuffle = useStore((s) => s.shuffle);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleShortcuts = useStore((s) => s.toggleShortcuts);
  const toggleInspector = useStore((s) => s.toggleInspector);
  const savePalette = useStore((s) => s.savePalette);
  const swatches = useStore((s) => s.swatches);
  const toggleLock = useStore((s) => s.toggleLock);
  const selectedId = useStore((s) => s.selectedId);
  const exportShareUrl = useStore((s) => s.exportShareUrl);
  const push = useToast((s) => s.push);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          savePalette();
          push('Palette saved', 'success');
          return;
        }
        return;
      }
      switch (e.key) {
        case ' ':
          e.preventDefault();
          shuffle();
          break;
        case '?':
        case '/':
          e.preventDefault();
          toggleShortcuts();
          break;
        case 'l':
        case 'L': {
          if (selectedId) {
            toggleLock(selectedId);
          } else if (swatches[0]) {
            toggleLock(swatches[0].id);
          }
          break;
        }
        case 't':
        case 'T':
          toggleTheme();
          break;
        case 'i':
        case 'I':
          toggleInspector();
          break;
        case 'c':
        case 'C': {
          // Copy share URL
          const url = exportShareUrl();
          navigator.clipboard.writeText(url).then(() => push('Share link copied', 'success'));
          break;
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shuffle, toggleTheme, toggleShortcuts, toggleInspector, savePalette, toggleLock, swatches, selectedId, exportShareUrl, push]);
}
