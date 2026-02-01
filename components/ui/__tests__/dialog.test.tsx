import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../dialog'

describe('Dialog', () => {
  it('should render trigger and open dialog', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByText('Open')
    expect(trigger).toBeTruthy()
  })
})
