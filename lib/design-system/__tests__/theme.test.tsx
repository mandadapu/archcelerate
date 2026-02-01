import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../theme-provider'

describe('ThemeProvider', () => {
  it('should provide default light theme', () => {
    function TestComponent() {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('should toggle between light and dark themes', () => {
    function TestComponent() {
      const { theme, setTheme } = useTheme()
      return (
        <div>
          <div data-testid="theme">{theme}</div>
          <button onClick={() => setTheme('dark')}>Toggle</button>
        </div>
      )
    }

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const button = screen.getByText('Toggle')
    button.click()

    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })
})
