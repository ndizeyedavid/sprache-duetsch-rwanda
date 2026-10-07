import type { Editor } from '@tiptap/react';
import { FiBold,FiImage,FiItalic,FiLink,FiList,FiRotateCcw,FiRotateCw } from 'react-icons/fi';

export function NotesToolbar({ editor }: { editor: Editor }) {
  const button = (active = false) => `btn btn-sm btn-square ${active ? 'btn-neutral' : 'btn-ghost'}`;
  return <div className="flex flex-wrap items-center gap-1 rounded-field bg-base-200 p-2" aria-label="Text formatting">
    <select aria-label="Text style" className="select select-sm mr-2 w-32 border-0 bg-base-100" value={editor.isActive('heading',{level:2})?'section':editor.isActive('heading',{level:3})?'subheading':'paragraph'} onChange={event=>{
      if(event.target.value==='paragraph')editor.chain().focus().setParagraph().run();
      else editor.chain().focus().setHeading({level:event.target.value==='section'?2:3}).run();
    }}><option value="paragraph">Paragraph</option><option value="section">Section</option><option value="subheading">Subheading</option></select>
    <button type="button" className={button(editor.isActive('bold'))} aria-label="Bold" aria-pressed={editor.isActive('bold')} onClick={()=>editor.chain().focus().toggleBold().run()}><FiBold aria-hidden/></button>
    <button type="button" className={button(editor.isActive('italic'))} aria-label="Italic" aria-pressed={editor.isActive('italic')} onClick={()=>editor.chain().focus().toggleItalic().run()}><FiItalic aria-hidden/></button>
    <button type="button" className={button(editor.isActive('bulletList'))} aria-label="Bullet list" onClick={()=>editor.chain().focus().toggleBulletList().run()}><FiList aria-hidden/></button>
    <button type="button" className={button(editor.isActive('orderedList'))} aria-label="Numbered list" onClick={()=>editor.chain().focus().toggleOrderedList().run()}>1.</button>
    <button type="button" className={button(editor.isActive('link'))} aria-label="Add link" onClick={()=>{const url=prompt('Link address',editor.getAttributes('link').href??'https://');if(url===null)return;if(!url.trim())editor.chain().focus().unsetLink().run();else editor.chain().focus().setLink({href:url}).run();}}><FiLink aria-hidden/></button>
    <button type="button" className={button()} aria-label="Add image" onClick={()=>{const url=prompt('Image address');if(url)editor.chain().focus().setImage({src:url}).run();}}><FiImage aria-hidden/></button>
    <span className="grow"/>
    <button type="button" className={button()} aria-label="Undo" disabled={!editor.can().undo()} onClick={()=>editor.chain().focus().undo().run()}><FiRotateCcw aria-hidden/></button>
    <button type="button" className={button()} aria-label="Redo" disabled={!editor.can().redo()} onClick={()=>editor.chain().focus().redo().run()}><FiRotateCw aria-hidden/></button>
  </div>;
}
