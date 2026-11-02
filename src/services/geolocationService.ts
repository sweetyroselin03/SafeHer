import { LocationRecord } from '../types'
import { StorageService } from './storageService'

export interface GeolocationResult {
  location: LocationRecord | null
  error?: string
  isCached: boolean
  cachedAgeDescription?: string
}

export class GeolocationService {
  /**
   * Acquire fresh GPS coordinates with timeout and fallback to cached.
   * Never blocks SOS activation indefinitely.
   */
  static async getCurrentLocation(timeoutMs = 7000): Promise<GeolocationResult> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const cached = this.getCachedLocation()
      return {
        location: cached,
        isCached: true,
        cachedAgeDescription: cached ? this.formatLocationAge(cached.timestamp) : undefined,
        error: 'Geolocation is not supported by your browser.',
      }
    }

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: timeoutMs,
            maximumAge: 30000, // Accept positions cached within 30 seconds
          }
        )
      })

      const locationRecord: LocationRecord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
        timestamp: pos.timestamp || Date.now(),
        source: 'fresh',
      }

      // Persist as last known position
      StorageService.saveLastLocation(locationRecord)

      return {
        location: locationRecord,
        isCached: false,
      }
    } catch (err: unknown) {
      let errorMessage = 'Unable to determine GPS location.'
      if (err && typeof err === 'object' && 'code' in err) {
        const geoError = err as GeolocationPositionError
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMessage = 'Location permission was denied. Please grant location access in browser settings.'
        } else if (geoError.code === geoError.TIMEOUT) {
          errorMessage = 'Location request timed out. High-accuracy GPS signal unavailable.'
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is currently unavailable from device sensors.'
        }
      }

      const cached = this.getCachedLocation()
      return {
        location: cached,
        isCached: true,
        cachedAgeDescription: cached ? this.formatLocationAge(cached.timestamp) : undefined,
        error: errorMessage,
      }
    }
  }

  static getCachedLocation(): LocationRecord | null {
    const cached = StorageService.getLastLocation()
    if (!cached) return null
    return {
      ...cached,
      source: 'cached',
    }
  }

  static formatLocationAge(timestamp: number): string {
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
    if (diffSec < 60) return `${diffSec} seconds ago`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  static getGoogleMapsUrl(lat: number, lon: number): string {
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lon.toFixed(6)}`
  }
}
