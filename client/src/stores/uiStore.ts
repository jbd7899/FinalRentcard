import { create } from 'zustand';
import type { ReactNode } from 'react';

type LoadingState = {
  [key: string]: boolean;
};

type Modal = {
  isOpen: boolean;
  type: string;
  data?: any;
};

type ToastType = 'default' | 'destructive' | 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  title: string;
  description?: ReactNode;
  type: ToastType;
  duration?: number;
};

// New type definitions
type TimeFilter = '7days' | '30days' | '90days' | 'all';

type ScreeningState = {
  currentStep: number;
  screeningPageUrl?: string;
  setScreeningStep: (step: number) => void;
  setScreeningUrl: (url: string) => void;
};

type DashboardState = {
  timeFilter: TimeFilter;
  showChart: boolean;
  showQRCode: boolean;
  showCopyAlert: boolean;
  setTimeFilter: (filter: TimeFilter) => void;
  setShowChart: (show: boolean) => void;
  setShowQRCode: (show: boolean) => void;
  setShowCopyAlert: (show: boolean) => void;
};

type ApplicationsState = {
  selectedProperty: string;
  selectedStatus: string;
  showReferences: boolean;
  setSelectedProperty: (property: string) => void;
  setSelectedStatus: (status: string) => void;
  setShowReferences: (show: boolean) => void;
};

type SidebarState = {
  isMobileOpen: boolean;
  isDesktopOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
  setDesktopOpen: (isOpen: boolean) => void;
};

type CarouselState = {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  setCanScrollPrev: (can: boolean) => void;
  setCanScrollNext: (can: boolean) => void;
};

interface UIState {
  // Loading states
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  
  // Modal management
  modal: Modal | null;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Feedback state
  feedback: {
    lastInteraction: string | null;
    lastRating: number | null;
    setLastInteraction: (interaction: string) => void;
    setLastRating: (rating: number) => void;
  };

  // Screening state
  screening: ScreeningState;

  // Dashboard state
  dashboard: DashboardState;

  // Applications state
  applications: ApplicationsState;

  // Sidebar state
  sidebar: SidebarState;

  // Carousel state
  carousel: CarouselState;
}

export const useUIStore = create<UIState>()((set) => ({
  // Loading states
  loadingStates: {},
  setLoading: (key: string, isLoading: boolean) => 
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: isLoading,
      },
    })),

  // Modal management
  modal: null,
  openModal: (type: string, data?: any) => 
    set({
      modal: {
        isOpen: true,
        type,
        data,
      },
    }),
  closeModal: () => set({ modal: null }),

  // Toast notifications
  toasts: [],
  addToast: (toast: Omit<Toast, 'id'>) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Math.random().toString(36).substring(2),
        },
      ],
    })),
  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  // Feedback state
  feedback: {
    lastInteraction: null,
    lastRating: null,
    setLastInteraction: (interaction: string) =>
      set((state) => ({
        feedback: { ...state.feedback, lastInteraction: interaction },
      })),
    setLastRating: (rating: number) =>
      set((state) => ({
        feedback: { ...state.feedback, lastRating: rating },
      })),
  },

  // Screening state
  screening: {
    currentStep: 1,
    screeningPageUrl: undefined,
    setScreeningStep: (step: number) =>
      set((state) => ({
        screening: { ...state.screening, currentStep: step },
      })),
    setScreeningUrl: (url: string) =>
      set((state) => ({
        screening: { ...state.screening, screeningPageUrl: url },
      })),
  },

  // Dashboard state
  dashboard: {
    timeFilter: '7days',
    showChart: false,
    showQRCode: false,
    showCopyAlert: false,
    setTimeFilter: (filter: TimeFilter) =>
      set((state) => ({
        dashboard: { ...state.dashboard, timeFilter: filter },
      })),
    setShowChart: (show: boolean) =>
      set((state) => ({
        dashboard: { ...state.dashboard, showChart: show },
      })),
    setShowQRCode: (show: boolean) =>
      set((state) => ({
        dashboard: { ...state.dashboard, showQRCode: show },
      })),
    setShowCopyAlert: (show: boolean) =>
      set((state) => ({
        dashboard: { ...state.dashboard, showCopyAlert: show },
      })),
  },

  // Applications state
  applications: {
    selectedProperty: 'all',
    selectedStatus: 'all',
    showReferences: false,
    setSelectedProperty: (property: string) =>
      set((state) => ({
        applications: { ...state.applications, selectedProperty: property },
      })),
    setSelectedStatus: (status: string) =>
      set((state) => ({
        applications: { ...state.applications, selectedStatus: status },
      })),
    setShowReferences: (show: boolean) =>
      set((state) => ({
        applications: { ...state.applications, showReferences: show },
      })),
  },

  // Sidebar state
  sidebar: {
    isMobileOpen: false,
    isDesktopOpen: true,
    setMobileOpen: (isOpen: boolean) =>
      set((state) => ({
        sidebar: { ...state.sidebar, isMobileOpen: isOpen },
      })),
    setDesktopOpen: (isOpen: boolean) =>
      set((state) => ({
        sidebar: { ...state.sidebar, isDesktopOpen: isOpen },
      })),
  },

  // Carousel state
  carousel: {
    canScrollPrev: false,
    canScrollNext: false,
    setCanScrollPrev: (can: boolean) =>
      set((state) => ({
        carousel: { ...state.carousel, canScrollPrev: can },
      })),
    setCanScrollNext: (can: boolean) =>
      set((state) => ({
        carousel: { ...state.carousel, canScrollNext: can },
      })),
  },
})); 