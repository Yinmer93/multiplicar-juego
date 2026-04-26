import { useState, useEffect } from 'react';

const PREFIX = 'guide_seen_';

/**
 * Returns [isOpen, open, close, isPulse]
 * - isOpen: whether the modal should be visible
 * - open: call to manually open
 * - close: call to dismiss
 * - isPulse: true briefly after mount if first visit (for the pulse animation)
 */
export default function useGuide(screenKey) {
  const storageKey = PREFIX + screenKey;
  const firstVisit = !localStorage.getItem(storageKey);

  const [isOpen, setIsOpen] = useState(firstVisit);
  const [isPulse, setIsPulse] = useState(false);

  useEffect(() => {
    if (firstVisit) {
      // Mark seen so it won't auto-open next time
      localStorage.setItem(storageKey, '1');
    } else {
      // Pulse the "?" button briefly to remind user it exists
      setIsPulse(true);
      const t = setTimeout(() => setIsPulse(false), 5000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function open()  { setIsOpen(true);  }
  function close() { setIsOpen(false); setIsPulse(false); }

  return [isOpen, open, close, isPulse];
}
