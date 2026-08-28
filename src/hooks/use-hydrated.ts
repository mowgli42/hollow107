import { useEffect, useState } from "react";
import { useCases } from "@/store/cases";

/** Persist rehydrates after mount; avoid flashing an empty queue. */
export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unsub = useCases.persist.onFinishHydration(() => setReady(true));
    if (useCases.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return ready;
}
