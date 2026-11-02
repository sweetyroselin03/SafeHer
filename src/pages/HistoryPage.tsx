import React, { useState } from 'react'
import {
  Clock,
  Trash2,
  Download,
  Filter,
  MapPin,
  AlertTriangle,
  FileText,
  MessageSquare,
  PhoneCall,
  Volume2,
  Mic,
  Zap,
  Shield,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { IncidentService } from '../services/incidentService'
import { IncidentType, Incident } from '../types'
import { GeolocationService } from '../services/geolocationService'

export const HistoryPage: React.FC = () => {
  const incidents = useAppStore(state => state.incidents)
  const refreshIncidents = useAppStore(state => state.refreshIncidents)
  const [filterType, setFilterType] = useState<string>('all')

  const handleDelete = (id: string) => {
    IncidentService.deleteEvent(id)
    refreshIncidents()
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local incident audit history? This action cannot be undone.')) {
      IncidentService.clearHistory()
      refreshIncidents()
    }
  }

  const handleExportJSON = () => {
    const jsonStr = IncidentService.exportHistoryJSON()
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SafeHer_Incident_Audit_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const filteredIncidents = filterType === 'all'
    ? incidents
    : incidents.filter(i => i.type === filterType)

  const getEventIcon = (type: IncidentType) => {
    switch (type) {
      case 'sos_activated':
        return <AlertTriangle className="w-4 h-4 text-[#E53945]" />
      case 'sos_prepared':
        return <FileText className="w-4 h-4 text-[#E9A23B]" />
      case 'whatsapp_opened':
        return <MessageSquare className="w-4 h-4 text-[#17865D]" />
      case 'location_captured':
        return <MapPin className="w-4 h-4 text-[#5B214C] dark:text-[#C773B1]" />
      case 'fake_call':
        return <PhoneCall className="w-4 h-4 text-blue-500" />
      case 'siren_activated':
        return <Volume2 className="w-4 h-4 text-red-500" />
      case 'recording_created':
        return <Mic className="w-4 h-4 text-purple-500" />
      case 'strobe_activated':
        return <Zap className="w-4 h-4 text-amber-500" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#17865D]" />
            <span>Incident Audit Trail</span>
          </h1>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            Tamper-resistant local chronological safety log.
          </p>
        </div>

        <div className="flex gap-2">
          {incidents.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExportJSON}
                title="Export History as JSON"
                className="p-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-xs font-semibold flex items-center gap-1 hover:bg-[#F7DDE7]/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                title="Clear all incidents"
                className="p-2 rounded-xl border border-red-200 dark:border-red-900/50 text-[#E53945] text-xs font-semibold hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <Filter className="w-3.5 h-3.5 text-[#746B77] dark:text-[#AFA5B4] shrink-0 ml-1" />
        {[
          { label: 'All Events', val: 'all' },
          { label: 'SOS Triggers', val: 'sos_activated' },
          { label: 'WhatsApp Links', val: 'whatsapp_opened' },
          { label: 'GPS Captures', val: 'location_captured' },
          { label: 'Fake Calls', val: 'fake_call' },
          { label: 'Sirens', val: 'siren_activated' },
          { label: 'Recordings', val: 'recording_created' },
        ].map((tab) => (
          <button
            key={tab.val}
            type="button"
            onClick={() => setFilterType(tab.val)}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
              filterType === tab.val
                ? 'bg-[#5B214C] text-white'
                : 'bg-white dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] text-[#746B77] dark:text-[#AFA5B4] hover:bg-[#F7DDE7]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1423] rounded-2xl p-8 border border-dashed border-[#F7DDE7] dark:border-[#3D2336] text-center space-y-2">
          <Clock className="w-8 h-8 text-[#746B77] dark:text-[#AFA5B4] mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8]">
            No Incident Records
          </h3>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            Emergency button activations, fake calls, and deterrence events will be logged here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredIncidents.map((inc) => {
            const meta = IncidentService.getIncidentTypeLabel(inc.type)
            const date = new Date(inc.timestamp)

            return (
              <div
                key={inc.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] flex items-center justify-center shrink-0 mt-0.5">
                    {getEventIcon(inc.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
                        {meta.title}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-[#746B77] dark:text-[#AFA5B4]">
                        {inc.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#746B77] dark:text-[#AFA5B4] flex flex-wrap items-center gap-x-2">
                      <span>{date.toLocaleDateString()} at {date.toLocaleTimeString()}</span>
                      {inc.location && (
                        <>
                          <span>•</span>
                          <a
                            href={GeolocationService.getGoogleMapsUrl(inc.location.latitude, inc.location.longitude)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5B214C] dark:text-[#C773B1] hover:underline flex items-center gap-0.5"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>{inc.location.latitude.toFixed(4)}, {inc.location.longitude.toFixed(4)}</span>
                          </a>
                        </>
                      )}
                    </div>

                    {inc.notes && (
                      <p className="text-[11px] text-[#241B28] dark:text-[#F7F3F8] bg-[#FFF9FB] dark:bg-[#140D17] px-2 py-1 rounded-lg border border-[#F7DDE7]/50 dark:border-[#3D2336]">
                        {inc.notes}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(inc.id)}
                  title="Delete event record"
                  className="p-1 rounded text-[#746B77] dark:text-[#AFA5B4] hover:text-[#E53945] hover:bg-black/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
