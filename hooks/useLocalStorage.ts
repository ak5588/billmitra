
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const jsonValue = localStorage.getItem(key);
      // Explicitly check for null and the string "undefined" which causes the JSON error
      if (jsonValue != null && jsonValue !== 'undefined') {
        return JSON.parse(jsonValue);
      }
    } catch (error) {
        console.error("Error parsing JSON from localStorage for key:", key, error);
    }

    return initialValue instanceof Function ? (initialValue as () => T)() : initialValue;
  });

  // This effect handles re-initializing state when the key changes (e.g., user logs in/out).
  useEffect(() => {
    try {
      const jsonValue = localStorage.getItem(key);
      if (jsonValue != null && jsonValue !== 'undefined') {
        setValue(JSON.parse(jsonValue));
      } else {
        // If storage is empty for the new key, reset to the initial value.
        setValue(initialValue instanceof Function ? (initialValue as () => T)() : initialValue);
      }
    } catch (error) {
      console.error("Error parsing JSON from localStorage for key:", key, error);
      setValue(initialValue instanceof Function ? (initialValue as () => T)() : initialValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // This effect handles persisting the state to localStorage whenever it changes.
  useEffect(() => {
    if (value === undefined) {
      // Instead of storing the string "undefined", we remove the key from storage.
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as [typeof value, typeof setValue];
}
