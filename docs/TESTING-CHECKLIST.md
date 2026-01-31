# MVP Testing Checklist

## Authentication Flow
- [ ] Sign up with email (Google OAuth)
- [ ] Login with correct credentials
- [ ] Login redirects to dashboard after success
- [ ] Logout redirects to login
- [ ] Protected routes redirect when not logged in
- [ ] Session persists across page reloads

## Skill Diagnosis
- [ ] Quiz loads all 20 questions
- [ ] Navigation between questions works
- [ ] Progress bar updates correctly
- [ ] Submit quiz completes successfully
- [ ] Results page shows skill scores
- [ ] Skill radar chart displays
- [ ] Recommended path is assigned
- [ ] Can only take quiz once

## Learning Platform
- [ ] Sprint overview loads correctly
- [ ] Concept pages display MDX content
- [ ] Mark concept complete works
- [ ] Progress persists after refresh
- [ ] Navigation between concepts works
- [ ] Progress bars update correctly
- [ ] Can access next concept after completing previous

## AI Mentor
- [ ] New conversation starts
- [ ] Messages send successfully
- [ ] Streaming responses work
- [ ] Context from concept page flows through
- [ ] Quick help suggestions work
- [ ] Conversation list shows all conversations
- [ ] Can reopen existing conversations
- [ ] Context badge displays correct sprint/concept
- [ ] Contextual help message appears

## Code Review
- [ ] Can submit GitHub repository URL
- [ ] GitHub integration fetches files
- [ ] Review completes in <60 seconds
- [ ] Review results display correctly
- [ ] Suggestions are categorized (error/warning/suggestion/praise)
- [ ] Scores are accurate
- [ ] Can submit revisions
- [ ] Submission limit works (3 per day)

## Labs
- [ ] Lab page loads with code editor
- [ ] Can write and edit code
- [ ] Monaco editor displays correctly
- [ ] Run code button works (stub implementation)
- [ ] Test cases display
- [ ] Submit runs all tests
- [ ] Passing labs marks as complete
- [ ] Failed tests show feedback

## Portfolio
- [ ] Shows all projects
- [ ] Displays completion status
- [ ] Links to GitHub/deployed apps work
- [ ] Scores display correctly
- [ ] Average score calculates correctly
- [ ] Stats cards show correct counts

## Navigation
- [ ] Dashboard link works
- [ ] AI Mentor link works
- [ ] Portfolio link works
- [ ] All internal links navigate correctly
- [ ] Back buttons work on all pages

## General
- [ ] Mobile responsive on all pages
- [ ] No console errors on page load
- [ ] All links work
- [ ] Forms validate correctly
- [ ] Error messages are helpful
- [ ] Loading states show appropriately
- [ ] No broken images
- [ ] All icons render
- [ ] Tailwind styles apply correctly

## Database (Prisma)
- [ ] User creation works
- [ ] Learning events are tracked
- [ ] Concept completions save
- [ ] Lab attempts store correctly
- [ ] Project submissions save
- [ ] Code review feedback saves
- [ ] Mentor conversations persist

## API Endpoints
- [ ] /api/diagnosis/analyze works
- [ ] /api/chat/stream works
- [ ] /api/code-review works
- [ ] /api/labs/execute returns response
- [ ] /api/labs/submit works
- [ ] /api/learning/complete works
- [ ] All endpoints handle auth correctly
- [ ] Rate limiting works where configured

## Performance
- [ ] Page load times < 3s
- [ ] No layout shift on load
- [ ] Images load properly
- [ ] Code editor loads without delay
- [ ] API responses < 2s (except AI calls)

## Known Issues / TODOs
- [ ] E2B sandbox needs actual implementation (currently stub)
- [ ] Lab content files need to be created
- [ ] Sprint 2-7 content needs expansion
- [ ] Email verification flow (if needed)
- [ ] Password reset flow (if needed)
