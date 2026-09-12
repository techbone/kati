import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

function startOfToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Local midnight of the current day, refreshed when the app returns to the
 * foreground. A schedule left open overnight must not still say "due today".
 */
export function useToday(): Date {
  const [today, setToday] = useState(startOfToday);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const next = startOfToday();
      setToday((prev) => (prev.getTime() === next.getTime() ? prev : next));
    });
    return () => sub.remove();
  }, []);

  return today;
}
