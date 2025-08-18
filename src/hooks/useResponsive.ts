import { useState, useEffect } from 'react';

// Tailwind CSS default breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof BREAKPOINTS;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint | 'xs';
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Custom hook for responsive design and device detection
 * Provides real-time information about screen size, device type, and user preferences
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Server-side rendering safe defaults
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        breakpoint: 'lg',
        orientation: 'landscape',
        isTouch: false,
        prefersReducedMotion: false,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg,
      breakpoint: getBreakpoint(width),
      orientation: width > height ? 'landscape' : 'portrait',
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState({
        width,
        height,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        breakpoint: getBreakpoint(width),
        orientation: width > height ? 'landscape' : 'portrait',
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      });
    };

    // Debounced resize handler for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdateState = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 100);
    };

    // Listen for resize events
    window.addEventListener('resize', debouncedUpdateState);
    
    // Listen for orientation changes (mobile devices)
    window.addEventListener('orientationchange', () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(updateState, 150);
    });

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, prefersReducedMotion: e.matches }));
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionPreferenceChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMotionPreferenceChange);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdateState);
      window.removeEventListener('orientationchange', updateState);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionPreferenceChange);
      } else {
        mediaQuery.removeListener(handleMotionPreferenceChange);
      }
    };
  }, []);

  return state;
}

/**
 * Determines the current breakpoint based on window width
 */
function getBreakpoint(width: number): Breakpoint | 'xs' {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook for checking if current screen size matches a specific breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useResponsive();
  return width >= BREAKPOINTS[breakpoint];
}

/**
 * Hook for getting responsive values based on current breakpoint
 */
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T | undefined {
  const { breakpoint } = useResponsive();
  
  // Return the value for current breakpoint or the closest smaller one
  const breakpointOrder: (Breakpoint | 'xs')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}