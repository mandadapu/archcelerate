// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkGfm from "remark-gfm";
var Lesson = defineDocumentType(() => ({
  name: "Lesson",
  filePathPattern: `modules/**/lesson-*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the lesson",
      required: true
    },
    description: {
      type: "string",
      description: "The description of the lesson",
      required: true
    },
    duration: {
      type: "number",
      description: "Estimated duration in minutes",
      required: true
    },
    difficulty: {
      type: "enum",
      options: ["beginner", "intermediate", "advanced"],
      description: "Difficulty level",
      required: true
    },
    objectives: {
      type: "list",
      of: { type: "string" },
      description: "Learning objectives",
      required: true
    },
    prerequisites: {
      type: "list",
      of: { type: "string" },
      description: "Prerequisites",
      required: false
    },
    tags: {
      type: "list",
      of: { type: "string" },
      description: "Tags for categorization",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^modules\//, "")
    },
    module: {
      type: "string",
      resolve: (doc) => {
        const match = doc._raw.flattenedPath.match(/modules\/([^\/]+)/);
        return match ? match[1] : "";
      }
    },
    order: {
      type: "number",
      resolve: (doc) => {
        const match = doc._raw.sourceFileName.match(/lesson-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }
    }
  }
}));
var Module = defineDocumentType(() => ({
  name: "Module",
  filePathPattern: `modules/**/module.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the module",
      required: true
    },
    description: {
      type: "string",
      description: "The description of the module",
      required: true
    },
    order: {
      type: "number",
      description: "Module order in curriculum",
      required: true
    },
    icon: {
      type: "string",
      description: "Icon name for the module",
      required: false
    },
    color: {
      type: "string",
      description: "Theme color for the module",
      required: false
    }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => {
        const match = doc._raw.flattenedPath.match(/modules\/([^\/]+)/);
        return match ? match[1] : "";
      }
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "content",
  documentTypes: [Lesson, Module],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: []
  }
});
export {
  Lesson,
  Module,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-GLQA6MIE.mjs.map
