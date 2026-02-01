# Module Builder Guide

## Overview

The Module Builder provides a visual interface for creating and organizing educational modules with drag-and-drop lesson management.

## Features

- **Visual Module Creation**: Build modules with title, description, and metadata
- **Drag-and-Drop Ordering**: Reorder lessons by dragging
- **Lesson Management**: Add, remove, and configure lessons
- **Live Preview**: See how your module will appear to students
- **Difficulty Tracking**: Visualize lesson difficulty distribution
- **Duration Calculation**: Automatic total duration calculation

## Creating a Module

### 1. Module Information

Navigate to `/admin/curriculum` and fill in:

**Module Title**
- Clear, descriptive name for the module
- Example: "Introduction to Machine Learning"

**Description**
- Brief overview of what students will learn
- 2-3 sentences recommended
- Example: "Learn the fundamentals of machine learning, including supervised and unsupervised learning algorithms."

### 2. Adding Lessons

For each lesson, provide:

**Lesson Title**
- Specific topic or concept
- Example: "Understanding Linear Regression"

**Duration**
- Estimated time in minutes
- Be realistic based on content complexity
- Default: 30 minutes

**Difficulty**
- Beginner: Introductory concepts, no prerequisites
- Intermediate: Assumes basic knowledge
- Advanced: Complex topics, requires prior learning

Click "Add Lesson" to add the lesson to your module.

### 3. Organizing Lessons

**Reorder Lessons**
1. Click and hold the grip icon (⋮⋮) on any lesson
2. Drag the lesson to the desired position
3. Release to drop

**Best Practices for Ordering**
- Start with foundational concepts
- Progress from simple to complex
- Group related topics together
- End with practical applications or projects

**Remove Lessons**
- Click the trash icon (🗑️) on any lesson
- Confirm deletion

### 4. Preview Your Module

Click "Show Preview" to see:
- Module header with title and description
- Statistics: lesson count, total duration, difficulty mix
- Difficulty distribution chart
- Complete lesson outline

Use preview to:
- Verify lesson order makes sense
- Check difficulty progression
- Ensure total duration is appropriate
- Review overall module structure

### 5. Save Your Module

Click "Save Module" to persist your changes.

**Note**: Currently saves to mock storage. Database integration pending.

## Module Statistics

The preview shows helpful metrics:

**Lesson Count**
- Total number of lessons in the module
- Aim for 5-10 lessons per module

**Total Duration**
- Sum of all lesson durations
- Target: 2-4 hours per module for online learning

**Difficulty Distribution**
- Visual breakdown of beginner/intermediate/advanced lessons
- Aim for progressive difficulty curve

## Lesson Structure

Each lesson card displays:
- **Order Number**: Position in the module
- **Title**: Lesson name
- **Duration**: Time estimate in minutes
- **Difficulty Badge**: Color-coded difficulty level
  - Green: Beginner
  - Yellow: Intermediate
  - Red: Advanced

## Drag-and-Drop

The module builder uses @dnd-kit for smooth drag-and-drop:

**Features**
- Visual feedback while dragging
- Snap-to-position ordering
- Keyboard accessibility (Tab + Space + Arrow keys)
- Touch screen support

**Keyboard Navigation**
1. Tab to the lesson you want to move
2. Press Space to pick up
3. Use Arrow keys to move up/down
4. Press Space to drop

## Tips for Effective Modules

### Module Design

1. **Clear Learning Path**: Each lesson should build on the previous
2. **Balanced Difficulty**: Don't jump from beginner to advanced
3. **Consistent Duration**: Keep lessons roughly the same length
4. **Practical Focus**: Include hands-on exercises
5. **Logical Grouping**: Related topics should be adjacent

### Lesson Progression

**Beginner-Heavy Modules**
- Start with 60-70% beginner content
- Gradually introduce intermediate concepts
- End with 1-2 advanced topics

**Intermediate Modules**
- Brief beginner review (20%)
- Focus on intermediate concepts (60%)
- Preview advanced topics (20%)

**Advanced Modules**
- Assume strong foundation
- Deep dives into complex topics
- Focus on real-world application

### Duration Guidelines

**Short Lessons (15-20 min)**
- Single concept focus
- Quick exercises
- Good for daily learning

**Medium Lessons (30-45 min)**
- Standard lesson length
- Multiple related concepts
- Balanced theory and practice

**Long Lessons (60+ min)**
- Complex topics
- Extensive hands-on work
- Project-based learning

## Database Integration

The module builder includes placeholder database operations in `src/lib/curriculum/module-operations.ts`:

**Available Functions**
- `getModules()`: Fetch all modules
- `getModuleById(id)`: Get specific module
- `createModule(data)`: Create new module
- `updateModule(id, data)`: Update module
- `deleteModule(id)`: Delete module
- `reorderLessons(moduleId, orders)`: Save lesson order
- `addLessonToModule(moduleId, data)`: Add lesson
- `removeLessonFromModule(moduleId, lessonId)`: Remove lesson

**Implementation Status**: Mock implementations - requires Prisma schema and database setup.

## Component Architecture

### ModuleBuilder
Main container component managing state and layout.

**State Management**
- Module metadata (title, description)
- Lesson list with ordering
- Preview visibility
- New lesson form data

### LessonDragDrop
Individual lesson component with drag functionality.

**Features**
- Sortable wrapper from @dnd-kit
- Visual drag handle
- Lesson information display
- Remove button

### ModulePreview
Read-only preview of completed module.

**Displays**
- Module header
- Statistics dashboard
- Difficulty distribution
- Lesson outline

## Styling

The module builder uses Tailwind CSS with:
- Purple primary color (#7c3aed)
- Responsive grid layout
- Smooth transitions
- Accessibility-focused design

**Color Scheme**
- Beginner: Green (#10b981)
- Intermediate: Yellow (#eab308)
- Advanced: Red (#ef4444)

## Accessibility

- **Keyboard Navigation**: Full keyboard support for drag-and-drop
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Indicators**: Clear focus states on interactive elements
- **Color Contrast**: WCAG AA compliant color combinations

## Future Enhancements

Planned features:
- Database persistence
- Module templates
- Bulk lesson import
- Lesson content preview
- Module duplication
- Version history
- Collaborative editing
- Module publishing workflow
