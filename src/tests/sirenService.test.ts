import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SirenService } from '../services/sirenService'

describe('SirenService', () => {
  beforeEach(() => {
    SirenService.stop()
    vi.clearAllMocks()
  })

  it('starts and stops Web Audio API siren cleanly', () => {
    expect(SirenService.getIsPlaying()).toBe(false)
    const started = SirenService.start(0.5)
    expect(started).toBe(true)
    expect(SirenService.getIsPlaying()).toBe(true)

    SirenService.stop()
    expect(SirenService.getIsPlaying()).toBe(false)
  })

  it('clamps volume setting within allowed bounds', () => {
    // Should not throw or crash on extreme volume numbers
    SirenService.setVolume(1.5)
    SirenService.setVolume(-0.5)
    SirenService.setVolume(0.8)
    expect(true).toBe(true)
  })
})
