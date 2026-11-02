import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  Send,
  PhoneCall,
  Copy,
  Share2,
  Volume2,
  VolumeX,
  Mic,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { GeolocationService, GeolocationResult } from '../services/geolocationService'
import { WhatsAppService, PreparedEmergencyMessage } from '../services/whatsappService'
import { IncidentService } from '../services/incidentService'
import { SirenService } from '../services/sirenService'
import { RecordingService } from '../services/recordingService'
import { SOSService } from '../services/sosService'
import { EmergencyContact, LocationRecord } from '../types'

export const SOSPage: React.FC = () => {
  const navigate = useNavigate()
  const profile = useAppStore(state => state.profile)
  const contacts = useAppStore(state => state.contacts)
  const settings = useAppStore(state => state.settings)
  const refreshIncidents = useAppStore(state => state.refreshIncidents)

  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(
    contacts.find(c => c.isPrimary) || contacts[0] || null
  )

  const [locationResult, setLocationResult] = useState<GeolocationResult | null>(null)
  const [isLocating, setIsLocating] = useState<boolean>(true)
  const [includeLocation, setIncludeLocation] = useState<boolean>(true)
  const [customNote, setCustomNote] = useState<string>('')
  const [preparedPayload, setPreparedPayload] = useState<PreparedEmergencyMessage | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null)

  // Siren and recorder toggles directly on emergency screen
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)

  // Initial trigger & GPS acquisition
  useEffect(() => {
    // Immediate haptics
    SOSService.triggerHaptic('emergency')

    // Initial check with cached location
    const cached = GeolocationService.getCachedLocation()
    if (cached) {
      setLocationResult({
        location: cached,
        isCached: true,
        cachedAgeDescription: GeolocationService.formatLocationAge(cached.timestamp),
      })
    }

    // Parallel fresh GPS acquisition
    let isMounted = true
    setIsLocating(true)

    GeolocationService.getCurrentLocation(7000).then((result) => {
      if (!isMounted) return
      setLocationResult(result)
      setIsLocating(false)

      if (result.location) {
        IncidentService.logEvent(
          'location_captured',
          'completed',
          result.location,
          `GPS coordinates acquired (${result.isCached ? 'cached' : 'fresh'})`
        )
      }
    })

    // Log the SOS activation
    IncidentService.logEvent(
      'sos_activated',
      'completed',
      cached || undefined,
      'SOS Emergency Screen triggered'
    )
    refreshIncidents()

    return () => {
      isMounted = false
      SirenService.stop()
      RecordingService.cancelRecording()
    }
  }, [refreshIncidents])

  // Re-compute prepared payload whenever location, contact, or note changes
  useEffect(() => {
    const loc = includeLocation && locationResult ? locationResult.location : null
    const phone = selectedContact ? selectedContact.phone : ''
    const payload = WhatsAppService.prepareEmergencyPayload(
      phone,
      profile,
      loc,
      includeLocation && Boolean(loc),
      customNote
    )
    setPreparedPayload(payload)
  }, [selectedContact, profile, locationResult, includeLocation, customNote])

  const handleSendWhatsApp = () => {
    if (!preparedPayload) return

    IncidentService.logEvent(
      'whatsapp_opened',
      'completed',
      locationResult?.location || undefined,
      `WhatsApp prepared for ${selectedContact?.name || 'Contact'} (${selectedContact?.phone || 'General'})`
    )
    refreshIncidents()

    WhatsAppService.openWhatsApp(preparedPayload.whatsappUrl)
    setStatusFeedback('Emergency message prepared. Complete sending in WhatsApp.')
  }

  const handleCopyMessage = async () => {
    if (!preparedPayload) return
    const success = await WhatsAppService.copyToClipboard(preparedPayload.rawText)
    if (success) {
      setCopied(true)
      setStatusFeedback('Message copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleShareNative = async () => {
    if (!preparedPayload) return
    const success = await WhatsAppService.shareNatively('SafeHer Emergency SOS', preparedPayload.rawText)
    if (success) {
      setStatusFeedback('Shared via device share sheet.')
    }
  }

  const handleEmergencyCall = () => {
    const number = settings.emergencyNumber || '112'
    SOSService.triggerEmergencyCall(number)
  }

  const toggleSiren = () => {
    if (isSirenActive) {
      SirenService.stop()
      setIsSirenActive(false)
    } else {
      SirenService.start(settings.sirenVolume || 0.8)
      setIsSirenActive(true)
      IncidentService.logEvent('siren_activated', 'completed')
      refreshIncidents()
    }
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await RecordingService.stopRecording()
      setIsRecording(false)
      setStatusFeedback('Audio evidence saved to local library!')
      refreshIncidents()
    } else {
      try {
        await RecordingService.startRecording()
        setIsRecording(true)
        IncidentService.logEvent('recording_created', 'completed')
        refreshIncidents()
      } catch (e) {
        setStatusFeedback('Microphone permission needed to record audio.')
      }
    }
  }

  const handleCancelSafe = () => {
    SirenService.stop()
    RecordingService.cancelRecording()
    navigate('/')
  }

  const currentLocation = locationResult?.location

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Top Emergency Beacon Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#E53945] via-[#C9232F] to-[#98101C] p-4 text-white shadow-lg shadow-[#E53945]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide">EMERGENCY ASSISTANCE ACTIVE</h1>
            <p className="text-xs text-white/90">Zero-server local emergency dispatch ready</p>
          </div>
        </div>
        <button
          onClick={handleCancelSafe}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          title="Exit emergency screen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Feedback Notice */}
      {statusFeedback && (
        <div className="p-3 rounded-xl bg-[#17865D]/10 border border-[#17865D]/30 text-xs font-semibold text-[#17865D] dark:text-[#2CD69A] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* GPS Location Acquisition Card */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${isLocating ? 'text-amber-500 animate-spin' : 'text-[#E53945]'}`} />
            <span className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
              {isLocating ? 'Acquiring Fresh GPS Signal...' : 'Emergency Coordinates'}
            </span>
          </div>

          <button
            onClick={() => {
              setIsLocating(true)
              GeolocationService.getCurrentLocation(8000).then((res) => {
                setLocationResult(res)
                setIsLocating(false)
              })
            }}
            disabled={isLocating}
            className="text-xs text-[#5B214C] dark:text-[#C773B1] flex items-center gap-1 hover:underline"
          >
            <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>Refresh GPS</span>
          </button>
        </div>

        {currentLocation ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
              <span className="font-mono bg-[#FFF9FB] dark:bg-[#140D17] px-2 py-1 rounded border border-[#F7DDE7] dark:border-[#3D2336]">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </span>
              <span className="text-[11px] text-[#746B77] dark:text-[#AFA5B4]">
                Accuracy: ±{currentLocation.accuracy}m
              </span>
            </div>

            {/* If cached / stale location warning */}
            {locationResult?.isCached && (
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Cached Location:</strong> Position recorded {locationResult.cachedAgeDescription}.
                  Signal may not reflect your current spot.
                </div>
              </div>
            )}

            {/* Toggle to include or exclude coordinates */}
            <label className="flex items-center gap-2 pt-1 text-xs text-[#5B214C] dark:text-[#C773B1] cursor-pointer">
              <input
                type="checkbox"
                checked={includeLocation}
                onChange={(e) => setIncludeLocation(e.target.checked)}
                className="rounded border-[#F7DDE7] text-[#E53945] focus:ring-[#E53945]"
              />
              <span>Include coordinates and Google Maps link in SOS message</span>
            </label>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs text-[#E53945] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              GPS unavailable or permission denied. SafeHer will still generate your emergency message without coordinates.
            </span>
          </div>
        )}
      </div>

      {/* Recipient Selection (if contacts exist) */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm">
        <label className="block text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] mb-2">
          Send Alert To:
        </label>
        {contacts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => setSelectedContact(contact)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedContact?.id === contact.id
                    ? 'bg-[#5B214C] text-white shadow-sm'
                    : 'bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] text-[#746B77] dark:text-[#AFA5B4] hover:bg-[#F7DDE7]/40'
                }`}
              >
                {contact.name} ({contact.relationship})
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            No contacts saved. Message will open WhatsApp for you to pick any chat.
          </p>
        )}

        {/* Optional quick emergency note input */}
        <div className="mt-3">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Add brief note: e.g. In dark alley / white sedan following"
            className="w-full px-3 py-2 rounded-xl text-xs border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
          />
        </div>
      </div>

      {/* Primary Actions: WhatsApp & 112 Direct Call */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Send via WhatsApp */}
        <button
          type="button"
          onClick={handleSendWhatsApp}
          className="p-4 rounded-2xl bg-[#17865D] hover:bg-[#14724F] text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#17865D]/30 transition-transform active:scale-[0.98]"
        >
          <Send className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm">Send WhatsApp SOS</div>
            <div className="text-[10px] font-normal opacity-90">Prefilled with coordinates & note</div>
          </div>
        </button>

        {/* Call Emergency Police 112 */}
        <button
          type="button"
          onClick={handleEmergencyCall}
          className="p-4 rounded-2xl bg-[#E53945] hover:bg-[#C9232F] text-white font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#E53945]/30 transition-transform active:scale-[0.98]"
        >
          <PhoneCall className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm">Call {settings.emergencyNumber || '112'}</div>
            <div className="text-[10px] font-normal opacity-90">National Emergency Services</div>
          </div>
        </button>
      </div>

      {/* Quick Deterrence Controls */}
      <div className="grid grid-cols-2 gap-3">
        {/* Siren Trigger */}
        <button
          type="button"
          onClick={toggleSiren}
          className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
            isSirenActive
              ? 'bg-[#E53945] text-white border-[#E53945] animate-pulse'
              : 'bg-white dark:bg-[#1E1423] text-[#E53945] border-[#E53945]/30 hover:bg-[#E53945]/10'
          }`}
        >
          {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isSirenActive ? 'Stop Alarm Siren' : 'Sound Alarm Siren'}</span>
        </button>

        {/* Audio Evidence Trigger */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
            isRecording
              ? 'bg-[#7C3AED] text-white border-[#7C3AED] animate-pulse'
              : 'bg-white dark:bg-[#1E1423] text-[#7C3AED] border-[#7C3AED]/30 hover:bg-[#7C3AED]/10'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isRecording ? 'Stop & Save Audio' : 'Record Audio Evidence'}</span>
        </button>
      </div>

      {/* Copy / Native Share Options */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-3">
        <div className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
          SOS Message Preview
        </div>
        <div className="p-3 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336] font-mono text-xs whitespace-pre-wrap text-[#241B28] dark:text-[#F7F3F8] max-h-36 overflow-y-auto">
          {preparedPayload?.rawText}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex-1 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F7DDE7]/40 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy SOS Text'}</span>
          </button>

          {preparedPayload?.canShareNatively && (
            <button
              type="button"
              onClick={handleShareNative}
              className="flex-1 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#F7DDE7]/40 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Exit / Safe Confirmation */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={handleCancelSafe}
          className="px-6 py-2.5 rounded-full text-xs font-bold text-[#746B77] dark:text-[#AFA5B4] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          I am Safe / Return to Dashboard
        </button>
      </div>
    </div>
  )
}
