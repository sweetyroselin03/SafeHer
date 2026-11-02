import { describe, it, expect, beforeEach } from 'vitest'
import { StorageService } from '../services/storageService'

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides default profile when storage is empty', () => {
    const profile = StorageService.getProfile()
    expect(profile).toBeDefined()
    expect(profile.onboardingCompleted).toBe(false)
  })

  it('adds and retrieves emergency contacts, automatically setting the first as primary', () => {
    const contact1 = StorageService.addContact({
      name: 'Priya',
      phone: '9876543210',
      relationship: 'Family',
      isPrimary: false,
    })

    expect(contact1.isPrimary).toBe(true) // First contact automatically marked primary

    const contact2 = StorageService.addContact({
      name: 'Rohan',
      phone: '9123456789',
      relationship: 'Friend',
      isPrimary: true, // Marking second as primary
    })

    const all = StorageService.getContacts()
    expect(all.length).toBe(2)
    const c1 = all.find(c => c.id === contact1.id)
    const c2 = all.find(c => c.id === contact2.id)

    expect(c2?.isPrimary).toBe(true)
    expect(c1?.isPrimary).toBe(false) // Unmarked previous primary
  })

  it('deletes contacts and reassigns primary if needed', () => {
    const c1 = StorageService.addContact({ name: 'A', phone: '1111111111', relationship: 'Family', isPrimary: true })
    const c2 = StorageService.addContact({ name: 'B', phone: '2222222222', relationship: 'Friend', isPrimary: false })

    StorageService.deleteContact(c1.id)
    const remaining = StorageService.getContacts()
    expect(remaining.length).toBe(1)
    expect(remaining[0].id).toBe(c2.id)
    expect(remaining[0].isPrimary).toBe(true) // Promoted to primary
  })

  it('exports all application data as JSON and imports it back', () => {
    StorageService.saveProfile({ displayName: 'Kavita' })
    StorageService.addContact({ name: 'Mom', phone: '9876543210', relationship: 'Family', isPrimary: true })

    const exported = StorageService.exportAllData()
    expect(exported).toContain('Kavita')
    expect(exported).toContain('Mom')

    localStorage.clear()
    expect(StorageService.getContacts().length).toBe(0)

    const importedSuccess = StorageService.importData(exported)
    expect(importedSuccess).toBe(true)
    expect(StorageService.getProfile().displayName).toBe('Kavita')
    expect(StorageService.getContacts().length).toBe(1)
  })
})
