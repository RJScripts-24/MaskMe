import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'maskme:tutorial:seen:';

interface UsePageTutorialOptions {
  autoStart?: boolean;
  autoStartDelayMs?: number;
}

export function usePageTutorial(pageKey: string, options?: UsePageTutorialOptions) {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const autoStart = options?.autoStart ?? true;
  const autoStartDelayMs = options?.autoStartDelayMs ?? 900;

  const startTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsTutorialOpen(false);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${pageKey}`, '1');
    } catch {
      // Keep behavior safe when storage is unavailable.
    }
  }, [pageKey]);

  useEffect(() => {
    let timerId: number | undefined;
    if (!autoStart) return;

    try {
      const hasSeenTutorial = localStorage.getItem(`${STORAGE_PREFIX}${pageKey}`) === '1';
      if (!hasSeenTutorial) {
        timerId = window.setTimeout(() => setIsTutorialOpen(true), autoStartDelayMs);
      }
    } catch {
      timerId = window.setTimeout(() => setIsTutorialOpen(true), autoStartDelayMs);
    }

    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [autoStart, autoStartDelayMs, pageKey]);

  return { isTutorialOpen, startTutorial, closeTutorial };
}
