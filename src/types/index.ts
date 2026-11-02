export interface UserProfile {
  id: string
  displayName: string
  emergencyNote: string
  preferredLanguage: string
  primaryContactId?: string
  photoUrl?: string
  onboardingCompleted: boolean
  createdAt: number
  updatedAt: number
}

export type ContactRelationship = 'Family' | 'Friend' | 'Partner' | 'Colleague' | 'Neighbor' | 'Other'

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: ContactRelationship
  isPrimary: boolean
  createdAt: number
  updatedAt: number
}

export interface LocationRecord {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  source: 'fresh' | 'cached'
}

export type IncidentType =
  | 'sos_activated'
  | 'sos_prepared'
  | 'whatsapp_opened'
  | 'location_captured'
  | 'fake_call'
  | 'siren_activated'
  | 'recording_created'
  | 'strobe_activated'

export interface Incident {
  id: string
  type: IncidentType
  timestamp: number
  status: 'completed' | 'cancelled' | 'pending' | 'failed'
  location?: LocationRecord
  notes?: string
}

export interface AudioEvidenceMetadata {
  id: string
  filename: string
  mimeType: string
  duration: number // in seconds
  size: number // in bytes
  createdAt: number
  incidentId?: string
}

export interface SafetySettings {
  shakeEnabled: boolean
  shakeThreshold: number // acceleration magnitude m/s^2
  shakeCooldown: number // cooldown in ms
  sosHoldDuration: number // hold time in ms (e.g. 1500)
  sirenVolume: number // 0.1 to 1.0
  visualAlertEnabled: boolean
  allowFlashingStrobe: boolean
  lowBatteryThreshold: number // percentage (e.g. 20)
  powerSavingEnabled: boolean
  reducedMotion: boolean
  emergencyNumber: string // e.g. "112"
  fakeCallDefaultCaller: string
  fakeCallDelay: number // in seconds
  darkMode: boolean
}

export interface BatteryState {
  isSupported: boolean
  level: number // 0 to 100
  charging: boolean
  chargingTime: number
  dischargingTime: number
}

export interface PermissionStatusSummary {
  geolocation: 'granted' | 'denied' | 'prompt' | 'unknown'
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown'
  motion: 'granted' | 'denied' | 'prompt' | 'unsupported'
  notifications: 'granted' | 'denied' | 'default' | 'unsupported'
}
