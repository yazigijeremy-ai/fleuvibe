import { useState, useCallback } from 'react';

/**
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export const useLocalStorage = (key, initialValue) => {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = useCallback((value) => {
    try {
      const toStore = value instanceof Function ? value(stored) : value;
      setStored(toStore);
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch {}
  }, [key, stored]);

  return [stored, setValue];
};
