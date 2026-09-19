import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiImage,
  FiLink,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiCode,
} from "react-icons/fi";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: string | null;
};

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

  function addLink() {
    const url = window.prompt("Link URL (https://…)");
    if (!url) return;
    if (url.trim() === "") editor?.chain().focus().unsetLink().run();
    else
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-visible rounded-box border bg-base-100 ${error ? "border-error" : "border-line"}`}
    >
      <div
        ref={toolbarRef}
        style={isStuck && toolbarBox ? { position: "fixed", top: HEADER, left: toolbarBox.left, width: toolbarBox.width, zIndex: 20 } : undefined}
        className={`flex flex-wrap gap-1 border-b border-line bg-base-200/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-base-200/90 ${isStuck ? "shadow-md rounded-t-box border-x border-t" : "rounded-t-box"}`}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
          aria-label="Bold"
        >
          <FiBold aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
          aria-label="Italic"
        >
          <FiItalic aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive("underline"))}
          aria-label="Underline"
        >
          <FiUnderline aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btn(editor.isActive("strike"))}
          aria-label="Strike"
        >
          S
        </button>
        <span className="mx-1 h-6 w-px self-center bg-line" aria-hidden />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={btn(editor.isActive("heading", { level: 1 }))}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btn(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btn(editor.isActive("heading", { level: 3 }))}
        >
          H3
        </button>
        <span className="mx-1 h-6 w-px self-center bg-line" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
          aria-label="Bullet list"
        >
          <FiList aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive("orderedList"))}
          aria-label="Ordered list"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btn(editor.isActive("blockquote"))}
          aria-label="Quote"
        >
          <FiCode aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px self-center bg-line" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btn(editor.isActive({ textAlign: "left" }))}
          aria-label="Align left"
        >
          <FiAlignLeft aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btn(editor.isActive({ textAlign: "center" }))}
          aria-label="Center"
        >
          <FiAlignCenter aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btn(editor.isActive({ textAlign: "right" }))}
          aria-label="Align right"
        >
          <FiAlignRight aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px self-center bg-line" aria-hidden />
        <input
          type="color"
          onChange={(e) =>
            editor.chain().focus().setColor(e.currentTarget.value).run()
          }
          value={editor.getAttributes("textStyle").color ?? "#374557"}
          className="h-6 w-6 cursor-pointer rounded-full border border-line p-0"
          title="Text color"
        />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btn(editor.isActive("highlight"))}
          aria-label="Highlight"
        >
          H
        </button>
        <span className="mx-1 h-6 w-px self-center bg-line" aria-hidden />
        <button
          type="button"
          onClick={addLink}
          className={btn(editor.isActive("link"))}
          aria-label="Link"
        >
          <FiLink aria-hidden />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="btn btn-xs rounded-full border-line bg-base-100"
          aria-label="Insert image"
        >
          <FiImage aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="btn btn-xs rounded-full border-line bg-base-100"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="btn btn-xs rounded-full border-line bg-base-100"
        >
          Redo
        </button>
      </div>
      {isStuck && toolbarBox ? <div aria-hidden style={{ height: toolbarBox.height }} /> : null}
      <div className="min-h-[180px] rounded-b-box bg-base-100">
        <EditorContent
          editor={editor}
          className="prose max-w-none p-4 text-sm leading-relaxed prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-img:rounded-box prose-a:text-brand prose-a:underline"
        />
      </div>
      {error ? (
        <p className="rounded-b-box border-t border-error bg-error/5 px-3 py-1.5 text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
