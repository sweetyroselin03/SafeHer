import { describe, it, expect, beforeEach } from 'vitest'
import { IncidentService } from '../services/incidentService'

describe('IncidentService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('logs incidents with timestamps and retrieves history chronologically', () => {
    IncidentService.logEvent('sos_activated', 'completed', undefined, 'Test hold button')
    IncidentService.logEvent('fake_call', 'completed', undefined, 'Simulated call')

    const history = IncidentService.getHistory()
    expect(history.length).toBe(2)
    expect(history[0].type).toBe('fake_call') // Newest first
    expect(history[1].type).toBe('sos_activated')
  })

  it('filters incident history by event type', () => {
    IncidentService.logEvent('siren_activated', 'completed')
    IncidentService.logEvent('fake_call', 'completed')
    IncidentService.logEvent('siren_activated', 'completed')

    const sirens = IncidentService.filterByType('siren_activated')
    expect(sirens.length).toBe(2)
  })

  it('deletes individual incidents and clears entire history', () => {
    const inc = IncidentService.logEvent('recording_created', 'completed')
    expect(IncidentService.getHistory().length).toBe(1)

    IncidentService.deleteEvent(inc.id)
    expect(IncidentService.getHistory().length).toBe(0)

    IncidentService.logEvent('strobe_activated', 'completed')
    IncidentService.clearHistory()
    expect(IncidentService.getHistory().length).toBe(0)
  })
})
