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

      expect(screen.getByText('Log Out')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to log out/i)).toBeInTheDocument()
    })

    it('should not render when open is false', () => {
      render(<SignOutDialog open={false} onOpenChange={mockOnOpenChange} />)

      expect(screen.queryByText('Log Out')).not.toBeInTheDocument()
    })

    it('should display both action buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Button Styling', () => {
    it('should have correct size for buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const confirmButton = screen.getByText('Confirm')
      const cancelButton = screen.getByText('Cancel')

      // size="lg" applies h-10 class
      expect(confirmButton).toHaveClass('h-10')
      expect(cancelButton).toHaveClass('h-10')
    })

    it('should have minimum width on buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const confirmButton = screen.getByText('Confirm')
      const cancelButton = screen.getByText('Cancel')

      expect(confirmButton).toHaveClass('min-w-[100px]')
      expect(cancelButton).toHaveClass('min-w-[100px]')
    })
  })

  describe('Functionality', () => {
    it('should call signOut when confirm button is clicked', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' })
      })
    })

    it('should call onOpenChange(false) when cancel button is clicked', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should disable buttons while signing out', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByText('Logging out...')).toBeInTheDocument()
      })

      // Both buttons should be disabled
      const loggingOutButton = screen.getByText('Logging out...')
      const cancelButton = screen.getByText('Cancel')

      expect(loggingOutButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('should change text to "Logging out..." when signing out', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const confirmButton = screen.getByText('Confirm')
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('Logging out...')).toBeInTheDocument()
        expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      // Dialog should be accessible
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
  })
})
