/**
 * Responsive Design Utility
 * 
 * Provides utilities for responsive design implementation.
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5
 */

/**
 * Breakpoint values matching Tailwind CSS defaults
 */
export const BREAKPOINTS = {
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536, // Extra large desktop
} as const;

/**
 * Device types
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

/**
 * Gets the current device type based on window width
 * 
 * @returns Current device type
 * 
 * Requirements 19.1, 19.2, 19.3, 19.4: Implement responsive breakpoints
 */
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return DeviceType.DESKTOP;
  }

  const width = window.innerWidth;

  if (width < BREAKPOINTS.md) {
    return DeviceType.MOBILE;
  } else if (width < BREAKPOINTS.lg) {
    return DeviceType.TABLET;
  } else {
    return DeviceType.DESKTOP;
  }
}

/**
 * Checks if the current device is mobile
 * 
 * @returns True if device is mobile
 */
export function isMobile(): boolean {
  return getDeviceType() === DeviceType.MOBILE;
}

/**
 * Checks if the current device is tablet
 * 
 * @returns True if device is tablet
 */
export function isTablet(): boolean {
  return getDeviceType() === DeviceType.TABLET;
}

/**
 * Checks if the current device is desktop
 * 
 * @returns True if device is desktop
 */
export function isDesktop(): boolean {
  return getDeviceType() === DeviceType.DESKTOP;
}

/**
 * Checks if the current viewport width matches a breakpoint
 * 
 * @param breakpoint - Breakpoint to check
 * @returns True if viewport matches breakpoint
 */
export function matchesBreakpoint(breakpoint: keyof typeof BREAKPOINTS): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth >= BREAKPOINTS[breakpoint];
}

/**
 * Gets responsive value based on device type
 * 
 * @param values - Object with values for each device type
 * @returns Value for current device type
 */
export function getResponsiveValue<T>(values: {
  mobile: T;
  tablet?: T;
  desktop: T;
}): T {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case DeviceType.MOBILE:
      return values.mobile;
    case DeviceType.TABLET:
      return values.tablet ?? values.desktop;
    case DeviceType.DESKTOP:
      return values.desktop;
    default:
      return values.desktop;
  }
}

/**
 * Touch target size constants
 * Requirement 19.5: Set minimum touch target size to 44x44 pixels
 */
export const TOUCH_TARGET = {
  MIN_SIZE: 44, // Minimum size in pixels for touch targets
  MIN_SPACING: 8, // Minimum spacing between touch targets
} as const;

/**
 * Validates if an element meets touch target size requirements
 * 
 * @param element - HTML element to validate
 * @returns True if element meets touch target requirements
 * 
 * Requirement 19.5: Ensure touch-friendly UI on mobile
 */
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= TOUCH_TARGET.MIN_SIZE && rect.height >= TOUCH_TARGET.MIN_SIZE;
}

/**
 * Responsive image sizes for different devices
 */
export const RESPONSIVE_IMAGE_SIZES = {
  mobile: {
    thumbnail: 100,
    small: 200,
    medium: 400,
    large: 640,
  },
  tablet: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1024,
  },
  desktop: {
    thumbnail: 200,
    small: 400,
    medium: 800,
    large: 1920,
  },
} as const;

/**
 * Gets appropriate image size for current device
 * 
 * @param size - Image size category
 * @returns Image size in pixels
 * 
 * Requirement 19.7: Ensure responsive images
 */
export function getResponsiveImageSize(
  size: 'thumbnail' | 'small' | 'medium' | 'large'
): number {
  const deviceType = getDeviceType();
  return RESPONSIVE_IMAGE_SIZES[deviceType][size];
}

/**
 * Responsive grid columns for different devices
 */
export const RESPONSIVE_GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;

/**
 * Gets appropriate grid column count for current device
 * 
 * @returns Number of grid columns
 */
export function getResponsiveGridColumns(): number {
  const deviceType = getDeviceType();
  return RESPONSIVE_GRID_COLUMNS[deviceType];
}

/**
 * Sets up a resize listener with debouncing
 * 
 * @param callback - Callback to execute on resize
 * @param delay - Debounce delay in milliseconds (default: 250)
 * @returns Cleanup function to remove listener
 */
export function onResize(callback: () => void, delay: number = 250): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let timeoutId: NodeJS.Timeout;

  const debouncedCallback = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };

  window.addEventListener('resize', debouncedCallback);

  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', debouncedCallback);
  };
}

/**
 * Responsive font sizes
 */
export const RESPONSIVE_FONT_SIZES = {
  mobile: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },
  tablet: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
  },
  desktop: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2.25rem',
  },
} as const;

/**
 * Checks if device supports touch
 * 
 * @returns True if device supports touch
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Gets viewport dimensions
 * 
 * @returns Object with width and height
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
