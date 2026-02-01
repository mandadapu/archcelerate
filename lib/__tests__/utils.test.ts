import { describe, it, expect } from '@jest/globals'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', false && 'conditional', 'always')).toBe('base-class always')
  })

  it('should merge tailwind classes without conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
