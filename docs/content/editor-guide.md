# Rich Content Editor Guide

## Overview

The Rich Content Editor provides a WYSIWYG editing experience with AI-powered assistance for creating educational content.

## Features

### Text Formatting

- **Bold**, *Italic*, `Inline Code`
- Headings (H1-H4)
- Bullet and numbered lists
- Blockquotes
- Code blocks with syntax highlighting
- Links and images

### AI Assistant

The AI Assistant provides four types of suggestions:

1. **Improve**: Enhance clarity and engagement of selected text
2. **Expand**: Add more details and examples
3. **Simplify**: Make content easier to understand
4. **Add Example**: Provide practical examples for concepts

### How to Use AI Assistance

1. Select text in the editor
2. Click the "AI Assistant" button
3. Choose the type of suggestion you want
4. Review the AI-generated suggestion
5. Click "Insert Suggestion" to apply

## Toolbar

### Text Formatting
- **Bold** (Ctrl/Cmd + B)
- **Italic** (Ctrl/Cmd + I)
- **Inline Code** (Ctrl/Cmd + E)

### Headings
- H1, H2, H3 buttons for different heading levels

### Lists
- Bullet List
- Numbered List
- Blockquote

### Media
- **Link**: Add hyperlinks to text
- **Image**: Insert images via URL

### History
- **Undo** (Ctrl/Cmd + Z)
- **Redo** (Ctrl/Cmd + Shift + Z)

## Creating Content

### 1. Start a New Lesson

Navigate to `/admin/editor` and:
1. Enter a lesson title
2. Start writing in the editor
3. Use the toolbar for formatting
4. Use AI Assistant for suggestions

### 2. Formatting Best Practices

**Headings**
- Use H1 for the main lesson title
- Use H2 for major sections
- Use H3-H4 for subsections

**Code Blocks**
```javascript
// Select language for syntax highlighting
function example() {
  return 'Hello, World!'
}
```

**Lists**
- Use bullet lists for unordered items
- Use numbered lists for sequential steps
- Keep list items concise

**Images**
- Use descriptive alt text
- Optimize images before uploading
- Use relative URLs when possible

### 3. AI-Enhanced Writing

**Improve Clarity**
Select unclear text and use "Improve" to:
- Simplify complex sentences
- Remove jargon
- Enhance readability

**Expand Content**
Select a concept and use "Expand" to:
- Add supporting details
- Include additional context
- Provide more explanation

**Simplify Content**
Select technical text and use "Simplify" to:
- Make it beginner-friendly
- Use simpler vocabulary
- Break down complex ideas

**Add Examples**
Select a concept and use "Add Example" to:
- Get practical code examples
- Real-world use cases
- Illustrative scenarios

### 4. Preview and Export

**Preview Mode**
- Click "Preview" to see how content will appear
- Review formatting and layout
- Check for any issues

**Export as MDX**
- Click "Export as MDX" to download
- File includes frontmatter with metadata
- Ready to add to content directory

## Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Bold | Cmd + B | Ctrl + B |
| Italic | Cmd + I | Ctrl + I |
| Code | Cmd + E | Ctrl + E |
| Undo | Cmd + Z | Ctrl + Z |
| Redo | Cmd + Shift + Z | Ctrl + Shift + Z |

## Tips for Effective Content

1. **Start with Structure**: Outline headings before writing
2. **Use AI Wisely**: Let AI enhance, not replace, your expertise
3. **Preview Often**: Check formatting as you write
4. **Keep Paragraphs Short**: 3-4 sentences max for readability
5. **Use Visual Elements**: Add images and code examples
6. **Write Scannable Content**: Use headings, lists, and formatting
7. **Test Examples**: Verify all code examples work
8. **Be Consistent**: Follow established style and formatting

## Troubleshooting

### AI Suggestions Not Working

1. Check you have text selected
2. Verify internet connection
3. Check browser console for errors
4. Try selecting different text

### Formatting Issues

1. Clear formatting: Select text and use Ctrl/Cmd + \
2. Copy without formatting: Use paste as plain text
3. Check HTML in preview mode

### Export Issues

1. Ensure you have a title
2. Check browser allows downloads
3. Verify file downloads to correct location

## Advanced Features

### Custom HTML

The editor supports custom HTML elements:
```html
<div class="custom-callout">
  Custom content
</div>
```

### Markdown Support

While this is a WYSIWYG editor, exported content is MDX-compatible with:
- Frontmatter metadata
- Custom React components
- Standard Markdown syntax

## Best Practices

1. **Save Frequently**: Use the Save button regularly
2. **Use Semantic HTML**: Proper heading hierarchy
3. **Optimize Images**: Compress before inserting
4. **Test Responsiveness**: Preview on different screen sizes
5. **Accessibility**: Use proper heading structure and alt text
6. **Version Control**: Export MDX files for backup

## Integration

The editor exports MDX files that work seamlessly with:
- Contentlayer content system
- Next.js MDX rendering
- Custom MDX components (Callout, Exercise, Quiz)

Simply export the MDX and place it in:
```
content/modules/[module-name]/lesson-[n]-[slug].mdx
```
