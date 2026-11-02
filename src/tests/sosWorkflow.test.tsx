import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SOSButton } from '../components/emergency/SOSButton'

describe('SOSButton Integration', () => {
  it('renders the Hold for SOS button and responds to tap mode toggle', () => {
    const handleTrigger = vi.fn()
    render(
      <MemoryRouter>
        <SOSButton onTrigger={handleTrigger} />
      </MemoryRouter>
    )

    const btn = screen.getByRole('button', { name: /Hold for SOS emergency activation/i })
    expect(btn).toBeInTheDocument()
    expect(screen.getByText(/HOLD FOR SOS/i)).toBeInTheDocument()

    // Toggle 1-tap accessibility mode
    const tapToggle = screen.getByText(/Motor accessibility: enable 1-tap mode/i)
    fireEvent.click(tapToggle)

    expect(screen.getByText(/Single tap mode/i)).toBeInTheDocument()

    // Now clicking the button should trigger immediately
    fireEvent.mouseDown(btn)
    expect(handleTrigger).toHaveBeenCalledTimes(1)
  })
})
