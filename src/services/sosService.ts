import { LocationRecord, UserProfile, EmergencyContact } from '../types'
import { GeolocationService, GeolocationResult } from './geolocationService'
import { WhatsAppService, PreparedEmergencyMessage } from './whatsappService'
import { IncidentService } from './incidentService'
import { StorageService } from './storageService'

export interface SOSSessionState {
  isActive: boolean
  startTime: number
  locationResult: GeolocationResult | null
  isLoadingLocation: boolean
  payload: PreparedEmergencyMessage | null
  selectedContact: EmergencyContact | null
}

export class SOSService {
  /**
   * Triggers haptic pulse on devices that support Vibration API
   */
  static triggerHaptic(type: 'warning' | 'emergency' | 'tap' = 'emergency'): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'emergency') {
        navigator.vibrate([250, 100, 250, 100, 400])
      } else if (type === 'warning') {
        navigator.vibrate([150, 80, 150])
      } else {
        navigator.vibrate(50)
      }
    }
  }

  /**
   * Initializes full emergency SOS sequence
   */
  static async activateSOS(
    profile: UserProfile,
    primaryContact: EmergencyContact | null
  ): Promise<{
    incidentId: string
    initialPayload: PreparedEmergencyMessage
    locationPromise: Promise<GeolocationResult>
  }> {
    // 1. Immediate haptic feedback
    this.triggerHaptic('emergency')

    // 2. Check for cached location immediately so user is never blocked
    const cachedLocation = GeolocationService.getCachedLocation()

    // 3. Prepare initial emergency message with cached location or placeholder
    const phone = primaryContact ? primaryContact.phone : ''
    const initialPayload = WhatsAppService.prepareEmergencyPayload(
      phone,
      profile,
      cachedLocation,
      Boolean(cachedLocation)
    )

    // 4. Log the emergency activation event
    const incident = IncidentService.logEvent(
      'sos_activated',
      'completed',
      cachedLocation || undefined,
      'Emergency SOS initiated via SafeHer Hold control'
    )

    // 5. Start parallel fresh GPS acquisition with bounded timeout (no blocking)
    const locationPromise = GeolocationService.getCurrentLocation(6500)

    return {
      incidentId: incident.id,
      initialPayload,
      locationPromise,
    }
  }

  /**
   * Calls emergency telephone service (e.g. 112)
   */
  static triggerEmergencyCall(emergencyNumber = '112'): void {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${emergencyNumber}`
    }
  }
}
