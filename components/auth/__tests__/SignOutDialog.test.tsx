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

      expect(screen.getByText('Sign out?')).toBeInTheDocument()
      expect(screen.getByText(/You can always sign back in anytime/i)).toBeInTheDocument()
    })

    it('should not render when open is false', () => {
      render(<SignOutDialog open={false} onOpenChange={mockOnOpenChange} />)

      expect(screen.queryByText('Sign out?')).not.toBeInTheDocument()
    })

    it('should display both action buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByText('Yes, sign me out')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Button Styling', () => {
    it('should have correct height for sign out button', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      expect(signOutButton).toHaveClass('h-9')
    })

    it('should have correct height for cancel button', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const cancelButton = screen.getByText('Cancel')
      expect(cancelButton).toHaveClass('h-9')
    })

    it('should have small text size on buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('text-sm')
      expect(cancelButton).toHaveClass('text-sm')
    })

    it('should have reduced padding on buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('px-4')
      expect(cancelButton).toHaveClass('px-4')
    })

    it('should have full width buttons', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('w-full')
      expect(cancelButton).toHaveClass('w-full')
    })

    it('should have rounded-full styling', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('rounded-full')
      expect(cancelButton).toHaveClass('rounded-full')
    })
  })

  describe('Functionality', () => {
    it('should call signOut when sign out button is clicked', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      fireEvent.click(signOutButton)

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

      const signOutButton = screen.getByText('Yes, sign me out')
      fireEvent.click(signOutButton)

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByText('Signing out...')).toBeInTheDocument()
      })

      // Both buttons should be disabled
      expect(signOutButton).toBeDisabled()
      expect(screen.getByText('Cancel')).toBeDisabled()
    })

    it('should change text to "Signing out..." when signing out', async () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(screen.getByText('Signing out...')).toBeInTheDocument()
        expect(screen.queryByText('Yes, sign me out')).not.toBeInTheDocument()
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

    it('should have focus management', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      // Buttons should be focusable
      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('focus-visible:outline-none')
      expect(cancelButton).toHaveClass('focus-visible:outline-none')
    })

    it('should have proper disabled state styling', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('disabled:opacity-50')
      expect(signOutButton).toHaveClass('disabled:cursor-not-allowed')
      expect(cancelButton).toHaveClass('disabled:opacity-50')
      expect(cancelButton).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('Visual Contrast', () => {
    it('should have contrasting button styles', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      // Sign out button: white background with black border
      expect(signOutButton).toHaveClass('bg-white')
      expect(signOutButton).toHaveClass('border-black')

      // Cancel button: dark background with white text
      expect(cancelButton).toHaveClass('bg-gray-900')
      expect(cancelButton).toHaveClass('text-white')
    })
  })

  describe('Button Sizing Regression', () => {
    it('should NOT have h-12 (old size)', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).not.toHaveClass('h-12')
      expect(cancelButton).not.toHaveClass('h-12')
    })

    it('should NOT have h-10 (intermediate size)', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).not.toHaveClass('h-10')
      expect(cancelButton).not.toHaveClass('h-10')
    })

    it('should have h-9 (current correct size)', () => {
      render(<SignOutDialog open={true} onOpenChange={mockOnOpenChange} />)

      const signOutButton = screen.getByText('Yes, sign me out')
      const cancelButton = screen.getByText('Cancel')

      expect(signOutButton).toHaveClass('h-9')
      expect(cancelButton).toHaveClass('h-9')
    })
  })
})
