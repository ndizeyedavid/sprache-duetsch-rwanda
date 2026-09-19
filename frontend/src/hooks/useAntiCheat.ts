import { useCallback, useEffect, useRef, useState } from "react";

export type ViolationType =
  | "copy"
  | "cut"
  | "paste"
  | "contextmenu"
  | "tab_switch"
  | "window_blur"
  | "fullscreen_exit"
  | "printscreen"
  | "select_all"
  | "refresh_attempt";

export type Violation = { type: ViolationType; at: number; message: string };

const MESSAGES: Record<ViolationType, string> = {
  copy: "Copying is not allowed during this assignment.",
  cut: "Cutting is not allowed.",
  paste: "Pasting is disabled for this assignment.",
  contextmenu: "Right-click is disabled.",
  tab_switch: "Tab switch detected — stay on this page.",
  window_blur: "Leaving the window is not allowed.",
  fullscreen_exit: "Exiting fullscreen is a violation.",
  printscreen: "Screenshots are not allowed.",
  select_all: "Select-all is disabled.",
  refresh_attempt: "Refreshing during assignment is a violation.",
};

export function useAntiCheat(
  enabled: boolean,
  maxViolations = 3,
  opts?: { persistKey?: string; onViolation?: (type: ViolationType) => void },
) {
  const [violations, setViolations] = useState<Violation[]>(() => {
    if (!opts?.persistKey) return [];
    try {
      const raw = localStorage.getItem(opts.persistKey);
      if (raw) return JSON.parse(raw) as Violation[];
    } catch {
      // ignore
    }
    return [];
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(Boolean(document.fullscreenElement));
  const containerRef = useRef<HTMLDivElement>(null);
  const lastViolationRef = useRef<number>(0);

  const persistKey = opts?.persistKey;

  useEffect(() => {
    if (!persistKey) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify(violations));
    } catch {
      // ignore
    }
  }, [violations, persistKey]);

  const addViolation = useCallback(
    (type: ViolationType) => {
      const now = Date.now();
      if (now - lastViolationRef.current < 900) return;
      lastViolationRef.current = now;
      setViolations((prev) => {
        if (prev.length >= maxViolations) return prev;
        const next: Violation[] = [...prev, { type, at: now, message: MESSAGES[type] }];
        if (opts?.onViolation) {
          try {
            opts.onViolation(type);
          } catch {
            // ignore
          }
        }
        return next;
      });
    },
    [maxViolations, opts],
  );

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
    } catch {
      // ignore — user may have denied
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void enterFullscreen();
  }, [enabled, enterFullscreen]);

  useEffect(() => {
    if (!enabled) return;
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy");
    };
    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("cut");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("paste");
    };
    const onContext = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("contextmenu");
    };
    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && ["c", "v", "x", "a", "p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        if (e.key.toLowerCase() === "c") addViolation("copy");
        else if (e.key.toLowerCase() === "v") addViolation("paste");
        else if (e.key.toLowerCase() === "x") addViolation("cut");
        else if (e.key.toLowerCase() === "a") addViolation("select_all");
        else addViolation("copy");
      }
      // Ctrl+R / Cmd+R refresh
      if (mod && e.key.toLowerCase() === "r") {
        e.preventDefault();
        addViolation("refresh_attempt");
      }
      if (e.key === "F5") {
        e.preventDefault();
        addViolation("refresh_attempt");
      }
      if (e.key === "PrintScreen") {
        e.preventDefault();
        addViolation("printscreen");
      }
      if (e.key === "F12" || (mod && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        addViolation("copy");
      }
    };
    const onVisibility = () => {
      if (document.hidden) addViolation("tab_switch");
    };
    const onBlur = () => addViolation("window_blur");
    const onFullscreen = () => {
      const fs = Boolean(document.fullscreenElement);
      setIsFullscreen(fs);
      if (!fs) addViolation("fullscreen_exit");
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving will flag this assignment. Are you sure?";
      addViolation("refresh_attempt");
      return e.returnValue;
    };
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext as never);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext as never);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [enabled, addViolation]);

  const locked = violations.length >= maxViolations;
  const remaining = Math.max(0, maxViolations - violations.length);

  return {
    containerRef,
    violations,
    locked,
    remaining,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    addViolation,
    clear: () => {
      setViolations([]);
      if (persistKey) localStorage.removeItem(persistKey);
    },
  };
}
