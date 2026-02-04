import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button.textContent).toBe('Click me')
  })

  it('should apply variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    // Check for actual CSS classes applied by the destructive variant
    expect(button.className).toContain('bg-destructive')
    expect(button.className).toContain('text-destructive-foreground')
  })

  it('should handle size variants', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole('button')
    // Check for actual CSS classes applied by the sm size variant
    expect(button.className).toContain('h-8')
    expect(button.className).toContain('px-3')
    expect(button.className).toContain('text-xs')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
