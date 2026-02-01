import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@/lib/test-utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../card'

describe('Card Component', () => {
  it('should render card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>Test Content</CardContent>
        <CardFooter>Test Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
    expect(screen.getByText('Test Footer')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class" data-testid="test-card">
        <CardContent>Content</CardContent>
      </Card>
    )

    const card = screen.getByTestId('test-card')
    expect(card).toHaveClass('custom-class')
  })

  it('should render without optional parts', () => {
    render(
      <Card>
        <CardContent>Just content</CardContent>
      </Card>
    )

    expect(screen.getByText('Just content')).toBeInTheDocument()
  })
})
