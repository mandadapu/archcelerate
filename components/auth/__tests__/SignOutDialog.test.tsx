import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignOutDialog } from '../SignOutDialog'
import { signOut } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('SignOutDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when open is true', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('SESSION TERMINATION')).toBeInTheDocument()
      expect(screen.getByText('CONFIRM IDENTITY DISCONNECT')).toBeInTheDocument()
    })

    it('should not render when open is false', () => {
      render(<SignOutDialog open={false} onOpenChange={mockOnOpenChange} />)

      expect(screen.queryByText('SESSION TERMINATION')).not.toBeInTheDocument()
    })

    it('should display both action buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('TERMINATE')).toBeInTheDocument()
      expect(screen.getByText('CANCEL')).toBeInTheDocument()
    })
  })

  describe('Button Styling', () => {
    it('should have correct size for buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const terminateButton = screen.getByText('TERMINATE')
      const cancelButton = screen.getByText('CANCEL')

      expect(terminateButton).toHaveClass('h-10')
      expect(cancelButton).toHaveClass('h-10')
    })
  })

  describe('Functionality', () => {
    it('should call signOut when terminate button is clicked', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const terminateButton = screen.getByText('TERMINATE')
      fireEvent.click(terminateButton)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/session-terminated' })
      })
    })

    it('should call onOpenChange(false) when cancel button is clicked', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const cancelButton = screen.getByText('CANCEL')
      fireEvent.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should show terminating state after clicking terminate', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const terminateButton = screen.getByText('TERMINATE')
      fireEvent.click(terminateButton)

      await waitFor(() => {
        expect(screen.getByText(/TERMINATING SESSION/)).toBeInTheDocument()
      })

      expect(screen.queryByText('TERMINATE')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('should have a dialog description for accessibility', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-describedby')
    })
  })
})
