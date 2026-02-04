import { describe, it, expect } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../theme-provider'

describe('ThemeProvider', () => {
  it('should provide default light theme', async () => {
    function TestComponent() {
      const { theme } = useTheme()
      return <div data-testid="theme">{theme}</div>
    }

    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <TestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light')
    })
  })

  it('should toggle between light and dark themes', async () => {
    const user = userEvent.setup()

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
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <TestComponent />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light')
    })

    const button = screen.getByText('Toggle')
    await act(async () => {
      await user.click(button)
    })

    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark')
    })
  })
})
