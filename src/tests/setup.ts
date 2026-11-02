import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}
// @ts-expect-error Mocking navigator.geolocation
global.navigator.geolocation = mockGeolocation

// Mock Vibration
// @ts-expect-error Mocking navigator.vibrate
global.navigator.vibrate = vi.fn(() => true)

// Mock AudioContext
class MockAudioContext {
  state = 'running'
  currentTime = 0
  createOscillator() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        value: 440,
      },
    }
  }
  createGain() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        value: 1,
      },
    }
  }
  close() {
    return Promise.resolve()
  }
}
// @ts-expect-error Mocking AudioContext
global.AudioContext = MockAudioContext
// @ts-expect-error Mocking webkitAudioContext
global.webkitAudioContext = MockAudioContext
