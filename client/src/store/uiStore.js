import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isSidebarOpen: true,
  activeModal: null, // e.g. 'login' | 'createChannel' | null

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
}));
