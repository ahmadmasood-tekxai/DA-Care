import { useEffect } from 'react';

/**
 * Shared behaviour for drawers, dialogs and menus: closes on Escape and
 * locks page scroll while open (without layout shift from the scrollbar).
 */
export function useOverlay(isOpen: boolean, onClose: () => void, { lockScroll = true } = {}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    if (lockScroll) {
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      if (lockScroll) {
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPadding;
      }
    };
  }, [isOpen, onClose, lockScroll]);
}
