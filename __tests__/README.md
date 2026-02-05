# MDX Content Validation Tests

## Overview

This directory contains automated tests to validate MDX content files and prevent compilation errors.

## Why These Tests Exist

MDX (Markdown + JSX) is sensitive to certain characters like `<` and `>` that can be interpreted as HTML/JSX tags. When these appear before numbers (e.g., `<3s`, `>10K`), MDX tries to parse them as invalid tags, causing "Failed to load concept content" errors.

## Tests Included

### 1. Comparison Operator Escaping
- **`<digit` patterns**: Checks for unescaped `<` before numbers
- **`>digit` patterns**: Checks for unescaped `>` before numbers
- **Common patterns**: Validates comparison operators in common variable patterns

### 2. Common MDX Pitfalls
- **JSX-like syntax**: Catches patterns like `<3` or `>10` that aren't HTML entities
- **Valid frontmatter**: Ensures all MDX files have proper YAML frontmatter
- **Unclosed JSX tags**: Basic validation for tag matching

### 3. Content Quality
- **Non-empty files**: Ensures files aren't empty
- **Meaningful content**: Validates files have substantial content after frontmatter

## Running the Tests

```bash
# Run all MDX validation tests
npm run test:mdx

# Run with watch mode (auto-rerun on file changes)
npm run test:watch

# Run all content tests
npm run test:content
```

## How to Fix Common Errors

### Error: Unescaped '<' before numbers

```mdx
❌ WRONG: latency <3s
✅ CORRECT: latency &lt;3s
```

### Error: Unescaped '>' before numbers

```mdx
❌ WRONG: volume >10K requests/day
✅ CORRECT: volume &gt;10K requests/day
```

### Error: Comparison operators in text

```mdx
❌ WRONG: if cost > 5000
✅ CORRECT: if cost &gt; 5000
```

## Quick Fix Script

If you have many files to fix, you can use this one-liner:

```bash
# Fix all <digit patterns
find content -name "*.mdx" -exec sed -i '' 's/<\([0-9]\)/\&lt;\1/g' {} \;

# Fix all >digit patterns
find content -name "*.mdx" -exec sed -i '' 's/>\([0-9]\)/\&gt;\1/g' {} \;
```

## Code Blocks Exception

Comparison operators inside code blocks (` ``` `) are automatically excluded from validation, as they're valid TypeScript/JavaScript syntax.

## CI/CD Integration

These tests run automatically on:
- Every pull request
- Every push to main branch
- Pre-commit hooks (if configured)

This ensures MDX errors are caught before reaching production.

## Adding New Validation Rules

To add new validation rules:

1. Open `__tests__/mdx-syntax-validation.test.ts`
2. Add a new `test.each(mdxFiles)` block
3. Define your validation logic
4. Run `npm run test:mdx` to verify

Example:

```typescript
test.each(mdxFiles)('%s should not have TODO comments', (filePath) => {
  const content = readFileSync(filePath, 'utf-8')
  const todos = content.match(/TODO:/gi)

  if (todos && todos.length > 0) {
    fail(`Found ${todos.length} TODO comments in ${filePath}`)
  }
})
```

## Best Practices

1. **Run tests before committing**: `npm run test:mdx`
2. **Fix errors immediately**: Don't let them accumulate
3. **Add new rules proactively**: If you encounter a new error type, add a test for it
4. **Keep tests fast**: These tests should run in <5 seconds

## Troubleshooting

**Problem**: Tests are too slow
**Solution**: The tests are already optimized to skip code blocks. If still slow, consider running them only on changed files.

**Problem**: False positives in code examples
**Solution**: Make sure code is wrapped in triple backticks (` ``` `)

**Problem**: Tests pass but page still fails to load
**Solution**: Check the browser console for the actual MDX compilation error - there may be a different syntax issue not covered by tests yet.

## Support

For questions or issues with these tests:
1. Check this README first
2. Review the test file: `__tests__/mdx-syntax-validation.test.ts`
3. Create an issue in the GitHub repo
