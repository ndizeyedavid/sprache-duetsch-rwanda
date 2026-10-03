import { useLayoutEffect, useRef, useState } from 'react';

type Point = { x: number; y: number; width: number };
type CanvasLayout = { columns: number; width: number; height: number; paths: string[] };

/** Measure the actual node centres so connectors follow wrapping and resizing. */
export function useLessonCanvas(key: string) {
  const ref = useRef<HTMLOListElement>(null);
  const [layout, setLayout] = useState<CanvasLayout>({ columns: 1, width: 0, height: 0, paths: [] });

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    function measure() {
      if (!grid) return;
      const bounds = grid.getBoundingClientRect();
      const nodes = Array.from(grid.querySelectorAll<HTMLElement>('[data-lesson-node]'));
      const capacity = bounds.width >= 1050 ? 6 : bounds.width >= 720 ? 4 : bounds.width >= 540 ? 3 : bounds.width >= 350 ? 2 : 1;
      const columns = nodes.length ? Math.ceil(nodes.length / Math.ceil(nodes.length / capacity)) : 1;
      const points = nodes.map((node): Point => {
        const rect = node.getBoundingClientRect();
        return { x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, width: bounds.width / columns };
      });
      const paths = points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        if (Math.abs(point.y - next.y) < 2) return `M ${point.x} ${point.y} H ${next.x}`;
        if (columns === 1) return `M ${point.x} ${point.y} V ${next.y}`;
        const direction = Math.floor(index / columns) % 2 === 0 ? 1 : -1;
        const outside = point.x + direction * (point.width / 2 - 12);
        return `M ${point.x} ${point.y} H ${outside - direction * 16} Q ${outside} ${point.y} ${outside} ${point.y + 16} V ${next.y - 16} Q ${outside} ${next.y} ${outside - direction * 16} ${next.y} H ${next.x}`;
      });
      setLayout((previous) => {
        const next = { columns, width: bounds.width, height: bounds.height, paths };
        return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    window.addEventListener('resize', measure);
    grid.querySelectorAll('[data-lesson-node]').forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [key, layout.columns]);

  return { ref, ...layout };
}
