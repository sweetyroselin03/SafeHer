import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wrench,
  PhoneCall,
  Volume2,
  Zap,
  Mic,
  FolderLock,
  Flame,
  AlertTriangle,
  StopCircle,
} from 'lucide-react'
import { SirenService } from '../services/sirenService'
import { RecordingService } from '../services/recordingService'
import { IncidentService } from '../services/incidentService'
import { useAppStore } from '../store/useAppStore'

export const SafetyToolsPage: React.FC = () => {
  const navigate = useNavigate()
  const settings = useAppStore(state => state.settings)
  const refreshIncidents = useAppStore(state => state.refreshIncidents)

  const [combinedActive, setCombinedActive] = useState(false)
  const [combinedTimer, setCombinedTimer] = useState<number | null>(null)

  const startCombinedMode = async () => {
    setCombinedActive(true)

    // 1. Start siren
    SirenService.start(settings.sirenVolume || 0.8)

    // 2. Start audio recorder
    try {
      await RecordingService.startRecording()
    } catch (e) {
      console.warn('Audio recording in combined mode not permitted')
    }

    // 3. Log combined event
    IncidentService.logEvent('sos_activated', 'completed', undefined, 'Combined Emergency Deterrence Mode Activated')
    refreshIncidents()
  }

  const stopCombinedMode = async () => {
    SirenService.stop()
    await RecordingService.stopRecording()
    setCombinedActive(false)
    if (combinedTimer) {
      clearInterval(combinedTimer)
      setCombinedTimer(null)
    }
  }

  const tools = [
    {
      id: 'fake-call',
      title: 'Fake Incoming Call',
      badge: 'Disguise',
      desc: 'Simulate an incoming phone call with ringtone, vibration, and responsive synthesized voice.',
      icon: PhoneCall,
      color: 'from-blue-500 to-indigo-600',
      action: () => navigate('/fake-call'),
    },
    {
      id: 'siren',
      title: 'Emergency Siren Alarm',
      badge: 'Acoustic',
      desc: 'Piercing dual-tone siren created with Web Audio API. Requires zero external audio files.',
      icon: Volume2,
      color: 'from-red-500 to-rose-600',
      action: () => navigate('/siren'),
    },
    {
      id: 'strobe',
      title: 'Visual Alert Strobe',
      badge: 'Visual',
      desc: 'High-contrast alternating red-and-white visual flasher with seizure safety controls.',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      action: () => navigate('/strobe'),
    },
    {
      id: 'recorder',
      title: 'Audio Evidence Recorder',
      badge: 'Evidence',
      desc: 'Zero-cloud microphone recording saved straight to browser IndexedDB storage.',
      icon: Mic,
      color: 'from-purple-500 to-pink-600',
      action: () => navigate('/recorder'),
    },
    {
      id: 'evidence',
      title: 'Evidence Library',
      badge: 'Local Vault',
      desc: 'Play, rename, or download recorded audio evidence files to your device storage.',
      icon: FolderLock,
      color: 'from-teal-500 to-emerald-600',
      action: () => navigate('/evidence'),
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#5B214C] dark:text-[#C773B1]" />
          <span>Safety Tools & Deterrence</span>
        </h1>
        <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
          Independent, offline-capable protection mechanisms.
        </p>
      </div>

      {/* Combined Emergency Deterrence Mode Box */}
      <div className={`p-4 rounded-3xl border transition-all ${
        combinedActive
          ? 'bg-red-500 text-white border-red-600 shadow-xl shadow-red-500/40 animate-pulse'
          : 'bg-gradient-to-r from-[#5B214C] to-[#3D1232] text-white shadow-md'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#FF5E6C]" />
            </div>
            <div>
              <div className="text-sm font-extrabold">Combined Emergency Mode</div>
              <div className="text-[11px] opacity-90">
                {combinedActive
                  ? 'Siren Alarm & Evidence Recording active!'
                  : 'Fires Siren + Recording simultaneously'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={combinedActive ? stopCombinedMode : startCombinedMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              combinedActive
                ? 'bg-white text-red-600 shadow-lg'
                : 'bg-[#FF5E6C] text-white hover:bg-[#E53945]'
            }`}
          >
            {combinedActive ? (
              <span className="flex items-center gap-1.5">
                <StopCircle className="w-4 h-4" /> Stop All
              </span>
            ) : (
              'Activate Both'
            )}
          </button>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <div
              key={tool.id}
              onClick={tool.action}
              className="p-4 rounded-2xl bg-white dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF9FB] dark:bg-[#140D17] text-[#746B77] dark:text-[#AFA5B4] border border-[#F7DDE7] dark:border-[#3D2336]">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8] group-hover:text-[#5B214C] dark:group-hover:text-[#C773B1] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mt-1 line-clamp-2">
                  {tool.desc}
                </p>
              </div>

              <div className="pt-4 text-xs font-semibold text-[#5B214C] dark:text-[#C773B1] flex items-center justify-between">
                <span>Launch Tool</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
