import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Sidebar state
  sidebarOpen: boolean
  
  // Modal state
  authModalOpen: boolean
  userMenuOpen: boolean
  
  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setAuthModalOpen: (open: boolean) => void
  setUserMenuOpen: (open: boolean) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      authModalOpen: false,
      userMenuOpen: false,
      
      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setAuthModalOpen: (open) => set({ authModalOpen: open }),
      
      setUserMenuOpen: (open) => set({ userMenuOpen: open }),
      
      closeAllModals: () => set({
        authModalOpen: false,
        userMenuOpen: false,
      }),
    }),
    {
      name: 'ui-storage',
      // Persist sidebar preference
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
