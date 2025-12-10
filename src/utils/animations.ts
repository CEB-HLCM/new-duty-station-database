// Animation and transition utilities for micro-interactions

/**
 * Standard animation durations (in ms)
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

/**
 * Standard easing functions
 */
export const EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

/**
 * Fade in animation
 */
export const fadeIn = {
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  animation: `fadeIn ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
};

/**
 * Slide in from top animation
 */
export const slideInFromTop = {
  '@keyframes slideInFromTop': {
    from: { transform: 'translateY(-20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  animation: `slideInFromTop ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
};

/**
 * Slide in from bottom animation
 */
export const slideInFromBottom = {
  '@keyframes slideInFromBottom': {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  animation: `slideInFromBottom ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
};

/**
 * Scale up animation
 */
export const scaleUp = {
  '@keyframes scaleUp': {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  animation: `scaleUp ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
};

/**
 * Pulse animation (for loading states)
 */
export const pulse = {
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  animation: `pulse ${ANIMATION_DURATION.slow * 2}ms ${EASING.easeInOut} infinite`,
};

/**
 * Hover grow effect
 */
export const hoverGrow = {
  transition: `transform ${ANIMATION_DURATION.fast}ms ${EASING.easeOut}`,
  '&:hover': {
    transform: 'scale(1.05)',
  },
};

/**
 * Hover lift effect (with shadow)
 */
export const hoverLift = {
  transition: `all ${ANIMATION_DURATION.fast}ms ${EASING.easeOut}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  },
};

/**
 * Focus visible styles for accessibility
 */
export const focusVisible = {
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: '2px',
    borderRadius: 1,
  },
};

/**
 * Smooth scroll behavior
 */
export const smoothScroll = {
  scrollBehavior: 'smooth',
};

/**
 * Card hover interaction
 */
export const cardHoverInteraction = {
  transition: `all ${ANIMATION_DURATION.normal}ms ${EASING.easeOut}`,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 4,
  },
  '&:active': {
    transform: 'translateY(-2px)',
  },
};

/**
 * Button press interaction
 */
export const buttonPressInteraction = {
  transition: `all ${ANIMATION_DURATION.fast}ms ${EASING.sharp}`,
  '&:active': {
    transform: 'scale(0.97)',
  },
};

/**
 * Ripple effect (Material-UI built-in, but here for reference)
 */
export const rippleEffect = {
  '& .MuiTouchRipple-root': {
    color: 'primary.main',
  },
};

/**
 * Stagger animation delay utility
 */
export const staggerDelay = (index: number, baseDelay: number = 50): { animationDelay: string } => ({
  animationDelay: `${index * baseDelay}ms`,
});

/**
 * Reduced motion preferences (accessibility)
 */
export const respectReducedMotion = (animationStyles: Record<string, unknown>) => ({
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    transition: 'none',
  },
  ...animationStyles,
});

