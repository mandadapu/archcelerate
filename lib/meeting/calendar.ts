/**
 * Calendar utilities for meeting management
 * Mock implementations ready for Google Calendar API integration
 */

export interface Attendee {
  email: string
  name?: string
  responseStatus?: 'needsAction' | 'accepted' | 'declined' | 'tentative'
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string // ISO format
  endTime: string // ISO format
  attendees: Attendee[]
  location?: string
  meetingLink?: string
}

export interface TimeSlot {
  start: string // ISO format
  end: string // ISO format
}

export interface AvailabilityResult {
  attendees: Array<{
    email: string
    available: boolean
    conflicts: Array<{
      start: string
      end: string
      title: string
    }>
  }>
}

/**
 * Check availability for attendees in a given time range
 * Mock implementation - replace with Google Calendar API
 */
export async function checkAvailability(
  attendees: string[],
  startTime: string,
  endTime: string
): Promise<AvailabilityResult> {
  // TODO: Integrate with Google Calendar API
  // For now, return mock data
  return {
    attendees: attendees.map(email => ({
      email,
      available: true,
      conflicts: []
    }))
  }
}

/**
 * Find available time slots for all attendees
 * Mock implementation - replace with Google Calendar API
 */
export async function findAvailableSlots(
  attendees: string[],
  startDate: string,
  endDate: string,
  durationMinutes: number,
  workingHours: { start: number; end: number } = { start: 9, end: 17 }
): Promise<TimeSlot[]> {
  // TODO: Integrate with Google Calendar API
  // For now, return mock slots
  const slots: TimeSlot[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Generate mock slots for next 3 business days
  for (let i = 0; i < 3; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // Morning slot
    const morningStart = new Date(date)
    morningStart.setHours(workingHours.start, 0, 0, 0)
    const morningEnd = new Date(morningStart)
    morningEnd.setMinutes(morningStart.getMinutes() + durationMinutes)

    slots.push({
      start: morningStart.toISOString(),
      end: morningEnd.toISOString()
    })

    // Afternoon slot
    const afternoonStart = new Date(date)
    afternoonStart.setHours(14, 0, 0, 0)
    const afternoonEnd = new Date(afternoonStart)
    afternoonEnd.setMinutes(afternoonStart.getMinutes() + durationMinutes)

    slots.push({
      start: afternoonStart.toISOString(),
      end: afternoonEnd.toISOString()
    })
  }

  return slots
}

/**
 * Create a calendar event
 * Mock implementation - replace with Google Calendar API
 */
export async function createEvent(
  title: string,
  description: string | undefined,
  startTime: string,
  endTime: string,
  attendees: string[],
  location?: string
): Promise<CalendarEvent> {
  // TODO: Integrate with Google Calendar API
  // For now, return mock event
  const event: CalendarEvent = {
    id: `event-${Date.now()}`,
    title,
    description,
    startTime,
    endTime,
    attendees: attendees.map(email => ({
      email,
      responseStatus: 'needsAction'
    })),
    location,
    meetingLink: location?.includes('http') ? location : undefined
  }

  console.log('Mock: Created calendar event:', event)

  return event
}

/**
 * Update an existing calendar event
 * Mock implementation - replace with Google Calendar API
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Omit<CalendarEvent, 'id'>>
): Promise<CalendarEvent> {
  // TODO: Integrate with Google Calendar API
  console.log('Mock: Updated calendar event:', eventId, updates)

  return {
    id: eventId,
    title: updates.title || 'Updated Event',
    startTime: updates.startTime || new Date().toISOString(),
    endTime: updates.endTime || new Date().toISOString(),
    attendees: updates.attendees || [],
    ...updates
  }
}

/**
 * Cancel a calendar event
 * Mock implementation - replace with Google Calendar API
 */
export async function cancelEvent(eventId: string): Promise<void> {
  // TODO: Integrate with Google Calendar API
  console.log('Mock: Cancelled calendar event:', eventId)
}

/**
 * Get upcoming events for a user
 * Mock implementation - replace with Google Calendar API
 */
export async function getUpcomingEvents(
  maxResults: number = 10
): Promise<CalendarEvent[]> {
  // TODO: Integrate with Google Calendar API
  // For now, return empty array
  return []
}

/**
 * Parse natural language time into ISO format
 * Examples: "tomorrow at 2pm", "next Monday at 10:00", "in 2 hours"
 */
export function parseNaturalTime(naturalTime: string): string | null {
  const now = new Date()
  const lower = naturalTime.toLowerCase()

  // Tomorrow
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Extract time if specified
    const timeMatch = naturalTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0
      const meridiem = timeMatch[3]?.toLowerCase()

      if (meridiem === 'pm' && hour < 12) hour += 12
      if (meridiem === 'am' && hour === 12) hour = 0

      tomorrow.setHours(hour, minute, 0, 0)
    } else {
      tomorrow.setHours(9, 0, 0, 0) // Default to 9 AM
    }

    return tomorrow.toISOString()
  }

  // Next week/Monday/etc.
  const dayMatch = naturalTime.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (dayMatch) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = days.indexOf(dayMatch[1].toLowerCase())
    const currentDay = now.getDay()

    const daysUntilTarget = ((targetDay - currentDay + 7) % 7) + 7
    const nextDay = new Date(now)
    nextDay.setDate(nextDay.getDate() + daysUntilTarget)
    nextDay.setHours(9, 0, 0, 0) // Default to 9 AM

    return nextDay.toISOString()
  }

  // Specific date (YYYY-MM-DD)
  const dateMatch = naturalTime.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (dateMatch) {
    const date = new Date(naturalTime)
    return date.toISOString()
  }

  return null
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`
}
