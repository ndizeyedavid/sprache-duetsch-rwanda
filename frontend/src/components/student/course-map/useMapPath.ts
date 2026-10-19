import { useLayoutEffect,useRef,useState } from 'react';

type MapPath = { width: number; height: number; points: string[] };

/** Measure each stop marker's centre so the zig-zag line follows the real layout as cards resize or wrap. */
export function useMapPath(key: string) {
  const ref = useRef<HTMLOListElement>(null);
  const [path, setPath] = useState<MapPath>({ width: 0, height: 0, points: [] });

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    function measure() {
      if (!list) return;
      const bounds = list.getBoundingClientRect();
      const points = Array.from(list.querySelectorAll<HTMLElement>('[data-map-node]')).map((node) => {
        const rect = node.getBoundingClientRect();
        return `${Math.round(rect.left - bounds.left + rect.width / 2)},${Math.round(rect.top - bounds.top + rect.height / 2)}`;
      });
      setPath((previous) => {
        const next = { width: Math.round(bounds.width), height: Math.round(bounds.height), points };
        return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    list.querySelectorAll('li').forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [key]);

  return { ref, ...path };
}
