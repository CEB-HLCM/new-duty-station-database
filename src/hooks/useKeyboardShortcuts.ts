// Custom hook for global keyboard shortcuts
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enableGlobalShortcuts?: boolean;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Provides global shortcuts and allows components to register their own
 */
export const useKeyboardShortcuts = (options?: UseKeyboardShortcutsOptions) => {
  const navigate = useNavigate();
  const shortcuts = options?.shortcuts || [];
  const enableGlobalShortcuts = options?.enableGlobalShortcuts !== false;

  // Global keyboard shortcut handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Exception: Allow Escape key even in input fields
      if (event.key !== 'Escape' && isInputField) {
        return;
      }

      // Check component-specific shortcuts first
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }

      // Global shortcuts (only if enabled)
      if (!enableGlobalShortcuts) return;

      // Escape key - Close dialogs/modals
      if (event.key === 'Escape') {
        // Let individual components handle their own Escape key behavior
        // This is just a fallback
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }

      // Ctrl+K / Cmd+K - Focus search (only if not in input field)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k' && !isInputField) {
        event.preventDefault();
        navigate('/search');
        // Focus search input after navigation
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        }, 100);
      }

      // Ctrl+H / Cmd+H - Go to home
      if ((event.ctrlKey || event.metaKey) && event.key === 'h' && !isInputField) {
        event.preventDefault();
        navigate('/');
      }

      // Ctrl+D / Cmd+D - Go to duty stations
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && !isInputField) {
        event.preventDefault();
        navigate('/duty-stations');
      }

      // Ctrl+M / Cmd+M - Go to maps
      if ((event.ctrlKey || event.metaKey) && event.key === 'm' && !isInputField) {
        event.preventDefault();
        navigate('/maps');
      }

      // Ctrl+R / Cmd+R - Go to requests (but allow default browser refresh behavior)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'r' && !isInputField) {
        event.preventDefault();
        navigate('/request');
      }

      // ? - Show keyboard shortcuts help (only if not in input field)
      if (event.key === '?' && event.shiftKey && !isInputField) {
        event.preventDefault();
        // Dispatch custom event for keyboard shortcuts dialog
        window.dispatchEvent(new CustomEvent('show-keyboard-shortcuts'));
      }
    },
    [navigate, shortcuts, enableGlobalShortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Expose method to get all shortcuts for help dialog
    getAllShortcuts: () => [
      ...shortcuts,
      ...(enableGlobalShortcuts
        ? [
            { key: 'k', ctrlKey: true, description: 'Focus search', action: () => {} },
            { key: 'h', ctrlKey: true, description: 'Go to home', action: () => {} },
            { key: 'd', ctrlKey: true, description: 'Go to duty stations', action: () => {} },
            { key: 'm', ctrlKey: true, description: 'Go to maps', action: () => {} },
            { key: 'r', ctrlKey: true, shiftKey: true, description: 'Go to requests', action: () => {} },
            { key: '?', shiftKey: true, description: 'Show keyboard shortcuts', action: () => {} },
            { key: 'Escape', description: 'Close dialogs/blur focus', action: () => {} },
          ]
        : []),
    ],
  };
};

/**
 * Format keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrlKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  
  // Format key name
  const keyName = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
  parts.push(keyName);
  
  return parts.join(isMac ? '' : '+');
};

