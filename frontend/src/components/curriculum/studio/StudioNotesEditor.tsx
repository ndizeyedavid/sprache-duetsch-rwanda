import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { noteTableNodes } from './note-table-nodes';
import { NotesToolbar } from './NotesToolbar';

export function StudioNotesEditor({value,onChange}:{value:string;onChange:(value:string)=>void}) {
  const editor=useEditor({
    extensions:[StarterKit.configure({link:{openOnClick:false}}),Image.configure({allowBase64:true}),TextStyle,Color,Highlight.configure({multicolor:true}),TextAlign.configure({types:['heading','paragraph']}),Placeholder.configure({placeholder:'Explain the idea, add examples, and make it yours…'}),...noteTableNodes],
    content:value,
    editorProps:{attributes:{'aria-label':'Lesson notes',role:'textbox','aria-multiline':'true'}},
    onUpdate:({editor:current})=>onChange(current.getHTML()),
  });
  useEffect(()=>{if(editor&&editor.getHTML()!==value)editor.commands.setContent(value,{emitUpdate:false});},[editor,value]);
  if(!editor)return <p className="p-5 text-sm text-base-content/50">Opening editor…</p>;
  return <div className="rounded-box bg-base-100"><NotesToolbar editor={editor}/><EditorContent editor={editor} className="course-content prose max-w-none overflow-x-auto p-4 text-sm leading-7 prose-headings:font-semibold prose-img:rounded-box"/></div>;
}
