import { LocationRecord, UserProfile } from '../types'
import { GeolocationService } from './geolocationService'

export interface PreparedEmergencyMessage {
  rawText: string
  encodedText: string
  whatsappUrl: string
  mapsUrl: string | null
  canShareNatively: boolean
}

export class WhatsAppService {
  /**
   * Sanitizes phone numbers into international E.164 digits format
   * (e.g. "+91 98765-43210" -> "919876543210")
   */
  static cleanPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    // If standard 10-digit Indian mobile number without country code
    if (digits.length === 10) {
      return '91' + digits
    }
    return digits
  }

  /**
   * Generates a structured, clear emergency message
   */
  static generateMessage(
    profile: UserProfile | null,
    location: LocationRecord | null,
    includeLocation: boolean = true,
    customNote?: string
  ): string {
    const sender = profile?.displayName ? `${profile.displayName}` : 'I'
    let text = `🚨 EMERGENCY SOS! 🚨\n\n${sender} need immediate assistance!\n`

    if (includeLocation && location) {
      const mapsUrl = GeolocationService.getGoogleMapsUrl(location.latitude, location.longitude)
      if (location.source === 'fresh') {
        text += `\n📍 My Live Location (GPS accurate to ~${location.accuracy}m):\n${mapsUrl}\n`
      } else {
        const age = GeolocationService.formatLocationAge(location.timestamp)
        text += `\n📍 Last Known Location (${age}):\n${mapsUrl}\n`
      }
    } else {
      text += `\n📍 Location coordinates currently unavailable.\n`
    }

    if (profile?.emergencyNote && profile.emergencyNote.trim().length > 0) {
      text += `\n📋 Medical/Emergency Info: ${profile.emergencyNote.trim()}\n`
    }

    if (customNote && customNote.trim().length > 0) {
      text += `\n⚠️ Alert Note: ${customNote.trim()}\n`
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    text += `\n⏰ Time: ${timeStr}`
    text += `\n🛡️ Sent via SafeHer Emergency System`

    return text
  }

  /**
   * Prepares the WhatsApp deep link and text package
   */
  static prepareEmergencyPayload(
    phone: string,
    profile: UserProfile | null,
    location: LocationRecord | null,
    includeLocation: boolean = true,
    customNote?: string
  ): PreparedEmergencyMessage {
    const cleanPhone = this.cleanPhoneNumber(phone)
    const rawText = this.generateMessage(profile, location, includeLocation, customNote)
    const encodedText = encodeURIComponent(rawText)
    
    // Direct wa.me link with phone number and prefilled text
    const whatsappUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodedText}` 
      : `https://wa.me/?text=${encodedText}`

    const mapsUrl = location 
      ? GeolocationService.getGoogleMapsUrl(location.latitude, location.longitude)
      : null

    const canShareNatively = typeof navigator !== 'undefined' && Boolean(navigator.share)

    return {
      rawText,
      encodedText,
      whatsappUrl,
      mapsUrl,
      canShareNatively,
    }
  }

  /**
   * Opens the WhatsApp conversation in browser/native app
   */
  static openWhatsApp(whatsappUrl: string): void {
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }

  /**
   * Shares via native Web Share API
   */
  static async shareNatively(title: string, text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
        })
        return true
      } catch (err) {
        // User cancelled or share failed
        return false
      }
    }
    return false
  }

  /**
   * Copies the emergency message to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (err) {
        console.error('Clipboard copy failed', err)
      }
    }
    return false
  }
}
