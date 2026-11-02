import { UserProfile, EmergencyContact, SafetySettings, Incident, LocationRecord } from '../types'

const STORAGE_KEYS = {
  PROFILE: 'safeher_user_profile',
  CONTACTS: 'safeher_emergency_contacts',
  SETTINGS: 'safeher_safety_settings',
  INCIDENTS: 'safeher_incident_history',
  LAST_LOCATION: 'safeher_last_known_location',
  STORAGE_VERSION: 'safeher_schema_version',
} as const

const CURRENT_SCHEMA_VERSION = 1

export const DEFAULT_SETTINGS: SafetySettings = {
  shakeEnabled: false,
  shakeThreshold: 22, // m/s^2
  shakeCooldown: 3000, // 3 seconds
  sosHoldDuration: 1500, // 1.5 seconds
  sirenVolume: 0.8,
  visualAlertEnabled: true,
  allowFlashingStrobe: false, // Default false for seizure safety
  lowBatteryThreshold: 20,
  powerSavingEnabled: false,
  reducedMotion: false,
  emergencyNumber: '112',
  fakeCallDefaultCaller: 'Mom – Mobile',
  fakeCallDelay: 0,
  darkMode: false,
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  displayName: '',
  emergencyNote: 'I have allergies to penicillin. Blood group: O+.',
  preferredLanguage: 'en',
  onboardingCompleted: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

export class StorageService {
  static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE)
      if (!data) return DEFAULT_PROFILE
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) }
    } catch (e) {
      console.error('Failed to parse user profile from storage', e)
      return DEFAULT_PROFILE
    }
  }

  static saveProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getProfile()
    const updated: UserProfile = {
      ...current,
      ...profile,
      updatedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated))
    return updated
  }

  static getContacts(): EmergencyContact[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS)
      if (!data) return []
      const contacts = JSON.parse(data)
      return Array.isArray(contacts) ? contacts : []
    } catch (e) {
      console.error('Failed to parse contacts from storage', e)
      return []
    }
  }

  static saveContacts(contacts: EmergencyContact[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts))
  }

  static addContact(contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>): EmergencyContact {
    const contacts = this.getContacts()
    const newContact: EmergencyContact = {
      ...contact,
      id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      isPrimary: contacts.length === 0 ? true : Boolean(contact.isPrimary),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // If marked as primary, unmark others
    if (newContact.isPrimary) {
      contacts.forEach(c => (c.isPrimary = false))
    }

    contacts.push(newContact)
    this.saveContacts(contacts)
    return newContact
  }

  static updateContact(id: string, updates: Partial<Omit<EmergencyContact, 'id' | 'createdAt'>>): EmergencyContact | null {
    const contacts = this.getContacts()
    const index = contacts.findIndex(c => c.id === id)
    if (index === -1) return null

    if (updates.isPrimary) {
      contacts.forEach(c => (c.isPrimary = false))
    }

    contacts[index] = {
      ...contacts[index],
      ...updates,
      updatedAt: Date.now(),
    }

    this.saveContacts(contacts)
    return contacts[index]
  }

  static deleteContact(id: string): boolean {
    const contacts = this.getContacts()
    const filtered = contacts.filter(c => c.id !== id)
    if (filtered.length === contacts.length) return false

    // If we deleted the primary contact, assign the next one as primary
    if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
      filtered[0].isPrimary = true
    }

    this.saveContacts(filtered)
    return true
  }

  static getSettings(): SafetySettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!data) return DEFAULT_SETTINGS
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
    } catch (e) {
      console.error('Failed to parse settings from storage', e)
      return DEFAULT_SETTINGS
    }
  }

  static saveSettings(settings: Partial<SafetySettings>): SafetySettings {
    const current = this.getSettings()
    const updated: SafetySettings = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
    return updated
  }

  static getLastLocation(): LocationRecord | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION)
      if (!data) return null
      return JSON.parse(data)
    } catch (e) {
      return null
    }
  }

  static saveLastLocation(loc: LocationRecord): void {
    localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(loc))
  }

  static getIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS)
      if (!data) return []
      return JSON.parse(data)
    } catch (e) {
      return []
    }
  }

  static saveIncidents(incidents: Incident[]): void {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents))
  }

  static addIncident(incident: Omit<Incident, 'id' | 'timestamp'>): Incident {
    const incidents = this.getIncidents()
    const record: Incident = {
      ...incident,
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    }
    incidents.unshift(record)
    // Keep max 100 incident entries to prevent storage bloat
    if (incidents.length > 100) incidents.length = 100
    this.saveIncidents(incidents)
    return record
  }

  static clearIncidents(): void {
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS)
  }

  static exportAllData(): string {
    const exportData = {
      version: CURRENT_SCHEMA_VERSION,
      exportTimestamp: new Date().toISOString(),
      profile: this.getProfile(),
      contacts: this.getContacts(),
      settings: this.getSettings(),
      incidents: this.getIncidents(),
    }
    return JSON.stringify(exportData, null, 2)
  }

  static importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile))
      if (data.contacts && Array.isArray(data.contacts)) this.saveContacts(data.contacts)
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
      if (data.incidents && Array.isArray(data.incidents)) this.saveIncidents(data.incidents)
      return true
    } catch (e) {
      console.error('Import failed', e)
      return false
    }
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
  }
}
