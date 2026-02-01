import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight, common } from 'lowlight'

const lowlight = createLowlight(common)

export const editorExtensions = [
  StarterKit.configure({
    codeBlock: false, // We'll use CodeBlockLowlight instead
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    placeholder: 'Start writing your lesson content...',
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-blue-600 underline hover:text-blue-800',
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: 'max-w-full h-auto rounded-lg',
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    HTMLAttributes: {
      class: 'hljs rounded-lg p-4 bg-gray-900 text-white overflow-x-auto',
    },
  }),
]
