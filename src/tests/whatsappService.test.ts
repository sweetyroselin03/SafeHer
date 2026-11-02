import { describe, it, expect } from 'vitest'
import { WhatsAppService } from '../services/whatsappService'
import { UserProfile, LocationRecord } from '../types'

describe('WhatsAppService', () => {
  it('cleans phone numbers and adds country code 91 for 10-digit Indian numbers', () => {
    expect(WhatsAppService.cleanPhoneNumber('9876543210')).toBe('919876543210')
    expect(WhatsAppService.cleanPhoneNumber('+91 98765 43210')).toBe('919876543210')
    expect(WhatsAppService.cleanPhoneNumber('+1 (555) 123-4567')).toBe('15551234567')
  })

  it('generates structured emergency SOS message with fresh GPS coordinates', () => {
    const profile: UserProfile = {
      id: 'test_user',
      displayName: 'Anita',
      emergencyNote: 'Asthma inhaler in bag',
      preferredLanguage: 'en',
      onboardingCompleted: true,
      createdAt: 1000,
      updatedAt: 1000,
    }

    const location: LocationRecord = {
      latitude: 12.9716,
      longitude: 77.5946,
      accuracy: 15,
      timestamp: Date.now(),
      source: 'fresh',
    }

    const message = WhatsAppService.generateMessage(profile, location, true, 'Dark alley near station')

    expect(message).toContain('EMERGENCY SOS!')
    expect(message).toContain('Anita need immediate assistance!')
    expect(message).toContain('https://www.google.com/maps?q=12.971600,77.594600')
    expect(message).toContain('Asthma inhaler in bag')
    expect(message).toContain('Dark alley near station')
    expect(message).toContain('Sent via SafeHer Emergency System')
  })

  it('handles message generation gracefully when location coordinates are excluded or missing', () => {
    const message = WhatsAppService.generateMessage(null, null, false)
    expect(message).toContain('Location coordinates currently unavailable')
    expect(message).toContain('Sent via SafeHer Emergency System')
  })

  it('prepares complete emergency payload with valid wa.me URL', () => {
    const payload = WhatsAppService.prepareEmergencyPayload('9876543210', null, null, false)
    expect(payload.whatsappUrl).toContain('https://wa.me/919876543210?text=')
    expect(payload.rawText).toBeTruthy()
    expect(payload.encodedText).toBe(encodeURIComponent(payload.rawText))
  })
})
