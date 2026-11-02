import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GeolocationService } from '../services/geolocationService'
import { StorageService } from '../services/storageService'

describe('GeolocationService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('formats location age correctly', () => {
    const now = Date.now()
    expect(GeolocationService.formatLocationAge(now - 15000)).toBe('15 seconds ago')
    expect(GeolocationService.formatLocationAge(now - 180000)).toBe('3 mins ago')
    expect(GeolocationService.formatLocationAge(now - 7200000)).toBe('2 hours ago')
    expect(GeolocationService.formatLocationAge(now - 86400000)).toBe('1 day ago')
  })

  it('generates standard Google Maps coordinate links', () => {
    const url = GeolocationService.getGoogleMapsUrl(28.6139, 77.2090)
    expect(url).toBe('https://www.google.com/maps?q=28.613900,77.209000')
  })

  it('persists and retrieves cached location records', () => {
    StorageService.saveLastLocation({
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 20,
      timestamp: Date.now() - 60000,
      source: 'fresh',
    })

    const cached = GeolocationService.getCachedLocation()
    expect(cached).toBeDefined()
    expect(cached?.latitude).toBe(19.0760)
    expect(cached?.source).toBe('cached')
  })
})
