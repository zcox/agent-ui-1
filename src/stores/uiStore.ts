import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isMobile: boolean;

  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true, // Default open on desktop
  isMobile: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openSidebar: () => set({ isSidebarOpen: true }),

  closeSidebar: () => set({ isSidebarOpen: false }),

  setIsMobile: (isMobile: boolean) =>
    set({
      isMobile,
      // Close sidebar by default on mobile
      isSidebarOpen: isMobile ? false : true,
    }),
}));
