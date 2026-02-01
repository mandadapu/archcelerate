import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'

export const Lesson = defineDocumentType(() => ({
  name: 'Lesson',
  filePathPattern: `modules/**/lesson-*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the lesson',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description of the lesson',
      required: true,
    },
    duration: {
      type: 'number',
      description: 'Estimated duration in minutes',
      required: true,
    },
    difficulty: {
      type: 'enum',
      options: ['beginner', 'intermediate', 'advanced'],
      description: 'Difficulty level',
      required: true,
    },
    objectives: {
      type: 'list',
      of: { type: 'string' },
      description: 'Learning objectives',
      required: true,
    },
    prerequisites: {
      type: 'list',
      of: { type: 'string' },
      description: 'Prerequisites',
      required: false,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: 'Tags for categorization',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^modules\//, ''),
    },
    module: {
      type: 'string',
      resolve: (doc) => {
        const match = doc._raw.flattenedPath.match(/modules\/([^\/]+)/)
        return match ? match[1] : ''
      },
    },
    order: {
      type: 'number',
      resolve: (doc) => {
        const match = doc._raw.sourceFileName.match(/lesson-(\d+)/)
        return match ? parseInt(match[1], 10) : 0
      },
    },
  },
}))

export const Module = defineDocumentType(() => ({
  name: 'Module',
  filePathPattern: `modules/**/module.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the module',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description of the module',
      required: true,
    },
    order: {
      type: 'number',
      description: 'Module order in curriculum',
      required: true,
    },
    icon: {
      type: 'string',
      description: 'Icon name for the module',
      required: false,
    },
    color: {
      type: 'string',
      description: 'Theme color for the module',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => {
        const match = doc._raw.flattenedPath.match(/modules\/([^\/]+)/)
        return match ? match[1] : ''
      },
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Lesson, Module],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
})
