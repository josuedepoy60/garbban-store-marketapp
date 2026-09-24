import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

// Préfixe versionné : changer la version invalide proprement les anciennes données.
const PREFIX = 'citydrive:v1:';

export async function loadJSON<T>(key: string): Promise<T | undefined> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

export function saveJSON(key: string, value: unknown) {
  AsyncStorage.setItem(PREFIX + key, JSON.stringify(value)).catch(() => {});
}

export async function clearAll() {
  const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
  await AsyncStorage.multiRemove(keys);
}

/**
 * État React sauvegardé sur l'appareil. La valeur initiale est affichée tout de suite,
 * puis remplacée par la valeur enregistrée dès qu'elle est lue.
 */
export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState(initial);
  const [hydrated, setHydrated] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    let alive = true;
    loadJSON<T>(key).then((stored) => {
      if (!alive) return;
      // Si l'utilisateur a déjà agi avant la lecture, sa valeur l'emporte.
      if (stored !== undefined && !touched.current) setValue(stored);
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => {
    if (hydrated) saveJSON(key, value);
  }, [key, value, hydrated]);

  const set: Dispatch<SetStateAction<T>> = (v) => {
    touched.current = true;
    setValue(v);
  };
  return [value, set, hydrated];
}
