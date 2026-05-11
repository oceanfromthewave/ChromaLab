import { create } from 'zustand';

export type Toast = { id: number; message: string; tone?: 'info' | 'success' | 'error' };

type State = {
  toasts: Toast[];
  push: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
};

let counter = 0;

export const useToast = create<State>((set, get) => ({
  toasts: [],
  push: (message, tone = 'info') => {
    const id = ++counter;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => get().dismiss(id), 2400);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
