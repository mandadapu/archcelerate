# Progress Tracking and Analytics Guide

## Overview

The Progress Tracking and Analytics system provides comprehensive insights into student learning progress, module completion, and engagement metrics.

## Features

- **Real-time Progress Tracking**: Track lesson and module completion
- **Time Tracking**: Monitor time spent on each lesson
- **Score Recording**: Record quiz and exercise scores
- **Visual Analytics**: Charts and graphs for progress visualization
- **Streak Tracking**: Gamification with daily learning streaks
- **Difficulty Analysis**: Progress breakdown by difficulty level
- **Daily Activity**: Historical activity tracking

## Student Progress Dashboard

### Accessing the Dashboard

Navigate to `/student/progress` to view your learning analytics.

### Dashboard Components

#### 1. Stats Overview Cards

**Lessons Completed**
- Shows completed vs total lessons
- Visual progress indicator
- Purple color theme

**Modules Completed**
- Completed vs total modules
- Blue color theme

**Time Spent**
- Total learning time in hours/minutes
- Green color theme

**Streak**
- Consecutive days of learning
- Orange color theme with flame icon

#### 2. Overall Progress Bar

- Percentage-based progress indicator
- Gradient purple-to-blue design
- Updates in real-time

#### 3. Daily Activity Chart

**Line Chart Features**
- Last 7 days of activity
- Lessons completed per day
- Time spent per day
- Interactive tooltips

**Insights**
- Identify learning patterns
- Track consistency
- Monitor peak learning times

#### 4. Module Completion Chart

**Bar Chart Features**
- Progress per module (0-100%)
- Horizontal bar chart
- Color-coded by completion percentage

**Use Cases**
- Identify modules needing attention
- Visualize learning distribution
- Track module priorities

#### 5. Difficulty Breakdown

**Progress Bars**
- Beginner (Green)
- Intermediate (Yellow)
- Advanced (Red)

**Metrics**
- Completed vs total per difficulty
- Percentage completion
- Visual progress bars

#### 6. Learning Insights

**Completion Rate**
- Overall lesson completion percentage
- Trend indicator

**Avg. Time per Lesson**
- Average duration spent per lesson
- Helps plan study sessions

**Active Modules**
- Number of modules in progress
- Focus indicator

## Tracking Progress

### Automatic Tracking

Progress is tracked automatically when you:
1. Complete a lesson
2. Finish a quiz or exercise
3. Spend time viewing content

### Manual Tracking

Use the API to manually track progress:

```typescript
// Track lesson completion
await fetch('/api/progress/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lessonId: 'lesson-123',
    completed: true,
    timeSpent: 45, // minutes
    score: 85, // optional, 0-100
  }),
})
```

### Retrieve Progress

```typescript
// Get lesson progress
const response = await fetch('/api/progress/track?lessonId=lesson-123')
const progress = await response.json()
// { lessonId, completed, timeSpent, score }
```

### Get Dashboard Stats

```typescript
// Get all stats for dashboard
const response = await fetch('/api/progress/stats')
const stats = await response.json()
// Returns full dashboard data
```

## Progress Data Model

### LessonProgress

```typescript
interface LessonProgress {
  lessonId: string
  lessonTitle: string
  moduleId: string
  moduleTitle: string
  completed: boolean
  completedAt?: Date
  timeSpent: number // minutes
  score?: number // 0-100
}
```

### ModuleProgress

```typescript
interface ModuleProgress {
  moduleId: string
  moduleTitle: string
  totalLessons: number
  completedLessons: number
  percentComplete: number
  timeSpent: number
  averageScore?: number
}
```

### UserProgress

```typescript
interface UserProgress {
  userId: string
  totalModules: number
  completedModules: number
  totalLessons: number
  completedLessons: number
  totalTimeSpent: number
  overallProgress: number
  moduleProgress: ModuleProgress[]
  recentActivity: LessonProgress[]
}
```

## Analytics Functions

### Track Lesson Progress

```typescript
import { trackLessonProgress } from '@/src/lib/analytics/progress-tracking'

await trackLessonProgress(userId, lessonId, {
  completed: true,
  timeSpent: 30,
  score: 90,
})
```

### Complete Lesson

```typescript
import { completeLesson } from '@/src/lib/analytics/progress-tracking'

await completeLesson(userId, lessonId, timeSpent, score)
```

### Update Lesson Time

```typescript
import { updateLessonTime } from '@/src/lib/analytics/progress-tracking'

await updateLessonTime(userId, lessonId, additionalMinutes)
```

### Get User Progress

```typescript
import { getUserProgress } from '@/src/lib/analytics/progress-tracking'

const progress = await getUserProgress(userId)
```

### Get Progress Stats

```typescript
import { getProgressStats } from '@/src/lib/analytics/progress-tracking'

const stats = await getProgressStats(userId)
// Returns: dailyActivity, difficultyBreakdown, moduleCompletion, streakDays
```

## Utility Functions

### Calculate Progress

```typescript
import { calculateProgress } from '@/src/lib/analytics/progress-tracking'

const percentage = calculateProgress(completedLessons, totalLessons)
// Returns: 0-100
```

### Format Duration

```typescript
import { formatDuration } from '@/src/lib/analytics/progress-tracking'

const formatted = formatDuration(125) // "2h 5m"
const formatted2 = formatDuration(45) // "45m"
```

## Chart Components

### CompletionChart

Reusable chart component for visualizing data.

**Line Chart**
```tsx
<CompletionChart
  type="line"
  data={activityData}
  dataKey="lessons"
  xAxisKey="date"
  title="Daily Activity"
/>
```

**Bar Chart**
```tsx
<CompletionChart
  type="bar"
  data={moduleData}
  dataKey="progress"
  xAxisKey="name"
  title="Module Completion"
/>
```

**Pie Chart**
```tsx
<CompletionChart
  type="pie"
  data={difficultyData}
  dataKey="value"
  title="Difficulty Distribution"
/>
```

## Gamification Features

### Streak Tracking

**Streak Calculation**
- Counts consecutive days with at least one completed lesson
- Resets if a day is missed
- Displayed with flame icon

**Benefits**
- Encourages daily learning
- Builds consistent habits
- Visual motivation

### Achievement System (Future)

Planned achievements:
- First lesson completed
- Module completed
- 7-day streak
- 30-day streak
- 100 lessons completed
- Master difficulty badge (complete all advanced lessons)

## Best Practices

### For Students

1. **Check Daily**: Review progress dashboard regularly
2. **Set Goals**: Use stats to set realistic learning goals
3. **Maintain Streaks**: Build consistent learning habits
4. **Balance Difficulty**: Progress through difficulty levels systematically
5. **Track Time**: Monitor time spent to optimize learning sessions

### For Instructors

1. **Monitor Engagement**: Use analytics to identify struggling students
2. **Adjust Content**: Modify lesson difficulty based on completion rates
3. **Encourage Consistency**: Promote streak maintenance
4. **Analyze Patterns**: Use daily activity data to optimize content release

## Privacy and Data

- Progress data is private to each user
- Only authenticated users can access their data
- No sharing without explicit permission
- Data used only for analytics and improvement

## Database Schema (Implementation Pending)

The system requires the following database tables:

**lesson_progress**
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  lesson_id VARCHAR NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  time_spent INTEGER DEFAULT 0,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
```

**user_streaks**
```sql
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### POST /api/progress/track

Track lesson progress.

**Request Body**
```json
{
  "lessonId": "string",
  "completed": boolean,
  "timeSpent": number,
  "score": number
}
```

**Response**
```json
{
  "success": true,
  "message": "Progress tracked successfully"
}
```

### GET /api/progress/track?lessonId=xxx

Get lesson progress.

**Response**
```json
{
  "lessonId": "string",
  "completed": boolean,
  "timeSpent": number,
  "score": number
}
```

### GET /api/progress/stats

Get dashboard statistics.

**Response**
```json
{
  "stats": {
    "totalModules": number,
    "completedModules": number,
    "totalLessons": number,
    "completedLessons": number,
    "totalTimeSpent": number,
    "overallProgress": number,
    "streakDays": number
  },
  "dailyActivity": [...],
  "difficultyBreakdown": [...],
  "moduleCompletion": [...],
  "moduleProgress": [...],
  "recentActivity": [...]
}
```

## Troubleshooting

### Data Not Updating

1. Check authentication
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure database connection is working

### Charts Not Displaying

1. Verify data format matches chart requirements
2. Check that data array is not empty
3. Ensure Recharts is properly installed
4. Check browser console for rendering errors

### Incorrect Statistics

1. Verify calculation logic in progress-tracking.ts
2. Check database queries return correct data
3. Ensure time zones are handled correctly
4. Validate data aggregation logic

## Future Enhancements

- **Leaderboards**: Compare progress with peers
- **Certificates**: Generate completion certificates
- **Export Reports**: Download progress reports
- **Email Summaries**: Weekly progress emails
- **Mobile App**: Native mobile analytics
- **Predictive Analytics**: AI-powered learning recommendations
- **Social Sharing**: Share achievements on social media
