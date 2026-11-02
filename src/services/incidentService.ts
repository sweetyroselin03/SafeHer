import { Incident, IncidentType, LocationRecord } from '../types'
import { StorageService } from './storageService'

export class IncidentService {
  static getHistory(): Incident[] {
    return StorageService.getIncidents()
  }

  static logEvent(
    type: IncidentType,
    status: 'completed' | 'cancelled' | 'pending' | 'failed' = 'completed',
    location?: LocationRecord,
    notes?: string
  ): Incident {
    return StorageService.addIncident({
      type,
      status,
      location,
      notes,
    })
  }

  static deleteEvent(id: string): boolean {
    const history = StorageService.getIncidents()
    const filtered = history.filter(item => item.id !== id)
    if (filtered.length === history.length) return false
    StorageService.saveIncidents(filtered)
    return true
  }

  static clearHistory(): void {
    StorageService.clearIncidents()
  }

  static filterByType(type: IncidentType): Incident[] {
    return StorageService.getIncidents().filter(item => item.type === type)
  }

  static exportHistoryJSON(): string {
    const history = StorageService.getIncidents()
    return JSON.stringify(history, null, 2)
  }

  static getIncidentTypeLabel(type: IncidentType): { title: string; color: string; iconName: string } {
    switch (type) {
      case 'sos_activated':
        return { title: 'SOS Emergency Activated', color: '#E53945', iconName: 'AlertTriangle' }
      case 'sos_prepared':
        return { title: 'Emergency Message Prepared', color: '#E9A23B', iconName: 'FileText' }
      case 'whatsapp_opened':
        return { title: 'WhatsApp Direct Link Opened', color: '#17865D', iconName: 'MessageSquare' }
      case 'location_captured':
        return { title: 'GPS Location Captured', color: '#5B214C', iconName: 'MapPin' }
      case 'fake_call':
        return { title: 'Simulated Incoming Call', color: '#2563EB', iconName: 'PhoneCall' }
      case 'siren_activated':
        return { title: 'Emergency Siren Alarm', color: '#DC2626', iconName: 'Volume2' }
      case 'recording_created':
        return { title: 'Audio Evidence Recorded', color: '#7C3AED', iconName: 'Mic' }
      case 'strobe_activated':
        return { title: 'Visual Emergency Strobe', color: '#EA580C', iconName: 'Zap' }
      default:
        return { title: 'Safety Event Logged', color: '#746B77', iconName: 'Shield' }
    }
  }
}
