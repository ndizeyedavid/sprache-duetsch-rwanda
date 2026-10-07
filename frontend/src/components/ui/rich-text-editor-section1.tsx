import {
FiAlignCenter,
FiAlignLeft,
FiAlignRight,
FiBold,
FiCode,
FiImage,
FiItalic,
FiLink,
FiList,
FiUnderline,
} from "react-icons/fi";
export function RichTextEditorSection1(props: { toolbarRef: import("react").RefObject<HTMLDivElement | null>; isStuck: boolean; toolbarBox: { width: number; left: number; height: number; } | null; HEADER: 56; editor: import("../../../node_modules/@tiptap/core/dist/index").Editor; btn: (active: boolean) => string; addLink: () => void; addImage: () => void }) {
const { toolbarRef, isStuck, toolbarBox, HEADER, editor, btn, addLink, addImage } = props;
return (<div
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
      </div>);
}
