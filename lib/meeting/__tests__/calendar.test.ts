/**
 * @jest-environment node
 */

import {
  parseNaturalTime,
  formatDuration,
  createEvent,
  findAvailableSlots,
} from '../calendar'

describe('parseNaturalTime', () => {
  it('parses "tomorrow at 2pm"', () => {
    const result = parseNaturalTime('tomorrow at 2pm')
    expect(result).not.toBeNull()
    const date = new Date(result!)
    expect(date.getHours()).toBe(14)
  })

  it('defaults to 9 AM for "tomorrow" without time', () => {
    const result = parseNaturalTime('tomorrow')
    expect(result).not.toBeNull()
    const date = new Date(result!)
    expect(date.getHours()).toBe(9)
  })

  it('parses "tomorrow at 10:30am"', () => {
    const result = parseNaturalTime('tomorrow at 10:30am')
    expect(result).not.toBeNull()
    const date = new Date(result!)
    expect(date.getHours()).toBe(10)
    expect(date.getMinutes()).toBe(30)
  })

  it('parses "next monday"', () => {
    const result = parseNaturalTime('next monday')
    expect(result).not.toBeNull()
    const date = new Date(result!)
    expect(date.getDay()).toBe(1) // Monday
    expect(date.getHours()).toBe(9)
  })

  it('parses ISO date string', () => {
    const result = parseNaturalTime('2026-03-15')
    expect(result).not.toBeNull()
    const date = new Date(result!)
    expect(date.getFullYear()).toBe(2026)
  })

  it('returns null for unrecognized input', () => {
    expect(parseNaturalTime('gibberish')).toBeNull()
  })
})

describe('formatDuration', () => {
  it('formats 1 minute (singular)', () => {
    expect(formatDuration(1)).toBe('1 minute')
  })

  it('formats 30 minutes (plural)', () => {
    expect(formatDuration(30)).toBe('30 minutes')
  })

  it('formats 60 minutes as 1 hour', () => {
    expect(formatDuration(60)).toBe('1 hour')
  })

  it('formats 120 minutes as 2 hours', () => {
    expect(formatDuration(120)).toBe('2 hours')
  })

  it('formats 90 minutes as hours and minutes', () => {
    expect(formatDuration(90)).toBe('1 hour 30 minutes')
  })
})

describe('createEvent', () => {
  it('sets meetingLink when location is a URL', async () => {
    const event = await createEvent('Meeting', undefined, '2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z', ['a@b.com'], 'https://meet.google.com/abc')
    expect(event.meetingLink).toBe('https://meet.google.com/abc')
  })

  it('does not set meetingLink for non-URL location', async () => {
    const event = await createEvent('Meeting', undefined, '2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z', ['a@b.com'], 'Room 101')
    expect(event.meetingLink).toBeUndefined()
  })

  it('creates event with attendees', async () => {
    const event = await createEvent('Test', 'desc', '2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z', ['x@y.com'])
    expect(event.title).toBe('Test')
    expect(event.attendees).toHaveLength(1)
    expect(event.attendees[0].email).toBe('x@y.com')
  })
})

describe('findAvailableSlots', () => {
  it('returns slots skipping weekends', async () => {
    // Start on a Monday
    const monday = '2026-02-23T00:00:00Z' // Feb 23, 2026 is a Monday
    const friday = '2026-02-27T00:00:00Z'
    const slots = await findAvailableSlots(['a@b.com'], monday, friday, 30)
    expect(slots.length).toBeGreaterThan(0)
    // All slots should be on weekdays
    for (const slot of slots) {
      const day = new Date(slot.start).getDay()
      expect(day).not.toBe(0) // not Sunday
      expect(day).not.toBe(6) // not Saturday
    }
  })
})
