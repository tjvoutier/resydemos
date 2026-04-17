// src/components/checkin/SectionEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import { useEffect } from 'react'

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
  const editor = useEditor({
    extensions: [StarterKit, BulletList, ListItem],
    content: initialContent ?? '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        style:
          'min-height: 80px; outline: none; padding: 12px; font-size: 14px; line-height: 1.75; color: #374151;',
      },
    },
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
      <div
        style={{
          background: readOnly ? '#fffbf7' : '#fff',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
