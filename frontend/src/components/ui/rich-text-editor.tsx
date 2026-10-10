import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent,useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect,useLayoutEffect,useRef,useState } from "react";
import type { Props } from './props';
import { createAddLink } from './rich-text-editor-add-link';
import { RichTextEditorSection1 } from './rich-text-editor-section1';
export function RichTextEditor({ value, onChange, placeholder, error }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [toolbarBox, setToolbarBox] = useState<{ width: number; left: number; height: number } | null>(null);

  const HEADER = 56;

  useLayoutEffect(() => {
    if (!containerRef.current || !toolbarRef.current) return;
    const update = () => {
      const c = containerRef.current!.getBoundingClientRect();
      const tbH = toolbarRef.current!.offsetHeight;
      const shouldStick = c.top < HEADER && c.bottom > HEADER + tbH + 16;
      setIsStuck(shouldStick);
      if (shouldStick) setToolbarBox({ width: c.width, left: c.left, height: tbH });
    };
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({
        placeholder:
          placeholder ??
          "Write lesson notes… Use the toolbar for bold, colors, headings, lists and images.",
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "");
  }, [value, editor]);

  if (!editor)
    return (
      <div className="rounded-box border border-line bg-base-100 p-4 text-sm text-muted">
        Loading editor…
      </div>
    );

  const btn = (active: boolean) =>
    `btn btn-xs rounded-full ${active ? "bg-brand text-white border-0" : "border-line bg-base-100"}`;

  function addImage() {
    const url = window.prompt("Image URL (https://…)");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  const addLink = (...args: Parameters<ReturnType<typeof createAddLink>>) => createAddLink({ editor })(...args);

  return (
    <div
      ref={containerRef}
      className={`overflow-visible rounded-box border bg-base-100 ${error ? "border-error" : "border-line"}`}
    >
      <RichTextEditorSection1 toolbarRef={toolbarRef} isStuck={isStuck} toolbarBox={toolbarBox} HEADER={HEADER} editor={editor} btn={btn} addLink={addLink} addImage={addImage} />
      {isStuck && toolbarBox ? <div aria-hidden style={{ height: toolbarBox.height }} /> : null}
      <div className="min-h-[180px] rounded-b-box bg-base-100">
        <EditorContent
          editor={editor}
          className="prose max-w-none p-4 text-sm leading-relaxed prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-img:rounded-box prose-a:text-brand prose-a:underline"
        />
      </div>
      {error ? (
        <p className="rounded-b-box border-t border-error bg-error text-error-content px-3 py-1.5 text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
