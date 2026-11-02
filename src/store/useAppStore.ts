import { create } from 'zustand'
import {
  UserProfile,
  EmergencyContact,
  SafetySettings,
  Incident,
  BatteryState,
  PermissionStatusSummary,
} from '../types'
import { StorageService } from '../services/storageService'
import { BatteryService } from '../services/batteryService'

interface AppState {
  profile: UserProfile
  contacts: EmergencyContact[]
  settings: SafetySettings
  incidents: Incident[]
  battery: BatteryState
  isOnline: boolean
  permissions: PermissionStatusSummary

  // Actions
  setProfile: (profile: Partial<UserProfile>) => void
  setContacts: (contacts: EmergencyContact[]) => void
  addContact: (contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) => EmergencyContact
  updateContact: (id: string, updates: Partial<EmergencyContact>) => void
  deleteContact: (id: string) => void
  setPrimaryContact: (id: string) => void
  setSettings: (settings: Partial<SafetySettings>) => void
  refreshIncidents: () => void
  setBattery: (battery: BatteryState) => void
  setIsOnline: (online: boolean) => void
  checkPermissions: () => Promise<void>
  toggleDarkMode: () => void
  resetAllData: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: StorageService.getProfile(),
  contacts: StorageService.getContacts(),
  settings: StorageService.getSettings(),
  incidents: StorageService.getIncidents(),
  battery: {
    isSupported: false,
    level: 0,
    charging: false,
    chargingTime: 0,
    dischargingTime: 0,
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  permissions: {
    geolocation: 'unknown',
    microphone: 'unknown',
    motion: 'prompt',
    notifications: 'default',
  },

  setProfile: (profileUpdates) => {
    const updated = StorageService.saveProfile(profileUpdates)
    set({ profile: updated })
  },

  setContacts: (contacts) => {
    StorageService.saveContacts(contacts)
    set({ contacts })
  },

  addContact: (contactData) => {
    const newContact = StorageService.addContact(contactData)
    set({ contacts: StorageService.getContacts() })
    return newContact
  },

  updateContact: (id, updates) => {
    StorageService.updateContact(id, updates)
    set({ contacts: StorageService.getContacts() })
  },

  deleteContact: (id) => {
    StorageService.deleteContact(id)
    set({ contacts: StorageService.getContacts() })
  },

  setPrimaryContact: (id) => {
    StorageService.updateContact(id, { isPrimary: true })
    set({ contacts: StorageService.getContacts() })
  },

  setSettings: (settingsUpdates) => {
    const updated = StorageService.saveSettings(settingsUpdates)
    // Synchronize dark mode class to html element
    if (typeof document !== 'undefined') {
      if (updated.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    set({ settings: updated })
  },

  refreshIncidents: () => {
    set({ incidents: StorageService.getIncidents() })
  },

  setBattery: (battery) => set({ battery }),

  setIsOnline: (isOnline) => set({ isOnline }),

  checkPermissions: async () => {
    const permissions: PermissionStatusSummary = {
      geolocation: 'unknown',
      microphone: 'unknown',
      motion: 'prompt',
      notifications: 'default',
    }

    if (typeof navigator !== 'undefined' && navigator.permissions) {
      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        permissions.geolocation = geo.state
      } catch (e) {
        // Ignored
      }

      try {
        const queryMethod = navigator.permissions.query.bind(navigator.permissions) as (desc: { name: string }) => Promise<PermissionStatus>
        const mic = await queryMethod({ name: 'microphone' })
        permissions.microphone = mic.state
      } catch (e) {
        // Ignored
      }

      if ('Notification' in window) {
        permissions.notifications = Notification.permission
      }
    }

    set({ permissions })
  },

  toggleDarkMode: () => {
    const current = get().settings.darkMode
    get().setSettings({ darkMode: !current })
  },

  resetAllData: () => {
    StorageService.clearAllData()
    set({
      profile: StorageService.getProfile(),
      contacts: [],
      settings: StorageService.getSettings(),
      incidents: [],
    })
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark')
    }
  },
}))
