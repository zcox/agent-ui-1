import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to manage auto-scroll behavior for chat messages.
 * Scrolls to bottom when new messages arrive, but only if user is already near bottom.
 */
export function useAutoScroll<T extends HTMLElement>(
  dependencies: unknown[] = []
) {
  const scrollRef = useRef<T>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Check if user is near bottom
  const checkScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Consider "near bottom" if within 100px
    const isNearBottom = distanceFromBottom < 100;

    setIsAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom && scrollHeight > clientHeight);
  }, []);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  // Auto-scroll when dependencies change
  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom('smooth');
    } else {
      checkScrollPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom('instant');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    scrollRef,
    isAutoScroll,
    showScrollButton,
    scrollToBottom,
    handleScroll,
  };
}
