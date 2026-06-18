import { useEffect, useRef, useState } from "react";

/**
 * Buffers a search box's text locally and pushes it upstream on a debounce.
 *
 * Why: list search lives in the URL, and writing every keystroke straight to
 * the URL makes the controlled input lag (each navigation re-renders the box
 * with the previous value, dropping fast keystrokes). This keeps the input
 * responsive while the URL — the source of truth — updates once typing settles.
 * Re-syncs to `value` when it changes externally (e.g. back/forward).
 */
export function useDebouncedSearch(
  value: string,
  onChange: (value: string) => void,
  delayMs = 300,
): [string, (next: string) => void] {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync when the upstream value changes (navigation, programmatic reset).
  useEffect(() => {
    setLocal(value);
  }, [value]);

  // Clear any pending timer on unmount.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleChange = (next: string) => {
    setLocal(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), delayMs);
  };

  return [local, handleChange];
}
