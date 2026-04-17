// src/components/checkin/SectionEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

type Props = {
  icon: string
  label: string
  subtitle?: string
  initialContent: string | null
  onChange: (html: string) => void
  readOnly?: boolean
}

export default function SectionEditor({
  icon,
  label,
  subtitle,
  initialContent,
  onChange,
  readOnly = false,
}: Props) {
  const [editorReady, setEditorReady] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? '',
    immediatelyRender: false,
    editable: !readOnly,
    editorProps: {
      attributes: {
        style:
          'min-height: 80px; outline: none; padding: 12px; font-size: 14px; line-height: 1.75; color: #374151;',
      },
    },
    onCreate() { setEditorReady(true) },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external content updates (e.g. after AI polish)
  useEffect(() => {
    if (!editor || initialContent === null) return
    const current = editor.getHTML()
    if (current !== initialContent) {
      editor.commands.setContent(initialContent, { emitUpdate: false })
    }
  }, [initialContent, editor])

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #fde8d1',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px 8px',
          borderBottom: '1px solid #fde8d1',
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '16px' }}>{icon}</span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: '#e11d48',
          }}
        >
          {label}
        </span>
        {subtitle && (
          <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
            {subtitle}
          </span>
        )}
      </div>
      {!readOnly && editorReady && editor && (
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '6px 10px',
            borderBottom: '1px solid #fde8d1',
            background: '#fffbf7',
          }}
        >
          {[
            { label: 'B', title: 'Bold', style: { fontWeight: 800 }, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
            { label: 'I', title: 'Italic', style: { fontStyle: 'italic' }, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
            { label: '•—', title: 'Bullet list', style: {}, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
          ].map(({ label, title, style, action, active }) => (
            <button
              key={title}
              title={title}
              onMouseDown={(e) => { e.preventDefault(); action() }}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                background: active ? '#fde8d1' : 'transparent',
                color: active ? '#e11d48' : '#6b7280',
                ...style,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div style={{ background: readOnly ? '#fffbf7' : '#fff' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
