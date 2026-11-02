import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Volume2, VolumeX, ArrowLeft, Shield, AlertTriangle, Sliders } from 'lucide-react'
import { SirenService } from '../services/sirenService'
import { IncidentService } from '../services/incidentService'
import { useAppStore } from '../store/useAppStore'

export const SirenPage: React.FC = () => {
  const navigate = useNavigate()
  const settings = useAppStore(state => state.settings)
  const setSettings = useAppStore(state => state.setSettings)
  const refreshIncidents = useAppStore(state => state.refreshIncidents)

  const [isPlaying, setIsPlaying] = useState(SirenService.getIsPlaying())
  const [volume, setVolume] = useState(settings.sirenVolume || 0.8)

  useEffect(() => {
    return () => {
      SirenService.stop()
    }
  }, [])

  const toggleSiren = () => {
    if (isPlaying) {
      SirenService.stop()
      setIsPlaying(false)
    } else {
      const started = SirenService.start(volume)
      if (started) {
        setIsPlaying(true)
        IncidentService.logEvent('siren_activated', 'completed')
        refreshIncidents()
      }
    }
  }

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    SirenService.setVolume(newVol)
    setSettings({ sirenVolume: newVol })
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tools')}
          className="p-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-[#E53945]" />
            <span>Emergency Siren Alarm</span>
          </h1>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            Synthesized acoustic deterrence running 100% offline.
          </p>
        </div>
      </div>

      {/* Main Siren Center Button */}
      <div className={`p-8 rounded-3xl border transition-all flex flex-col items-center justify-center text-center shadow-lg ${
        isPlaying
          ? 'bg-gradient-to-b from-[#E53945] to-[#B91C1C] text-white border-red-600 shadow-red-500/40 animate-pulse'
          : 'bg-white dark:bg-[#1E1423] border-[#F7DDE7] dark:border-[#3D2336]'
      }`}>
        <button
          type="button"
          onClick={toggleSiren}
          aria-label={isPlaying ? 'Stop Siren' : 'Start Siren'}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xl ${
            isPlaying
              ? 'bg-white text-[#E53945]'
              : 'bg-gradient-to-tr from-[#E53945] to-[#FF5E6C] text-white hover:scale-105'
          }`}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-14 h-14 mb-2 animate-bounce" />
              <span className="text-base font-extrabold tracking-wide">STOP SIREN</span>
            </>
          ) : (
            <>
              <Volume2 className="w-14 h-14 mb-2" />
              <span className="text-base font-extrabold tracking-wide">SOUND SIREN</span>
            </>
          )}
        </button>

        {/* Animated Waveform Visualization when active */}
        {isPlaying && (
          <div className="flex items-center justify-center gap-1.5 mt-6 h-10">
            {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full transition-all duration-150 animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        )}

        <p className={`text-xs mt-4 ${isPlaying ? 'text-white/90' : 'text-[#746B77] dark:text-[#AFA5B4]'}`}>
          {isPlaying
            ? 'Dual-tone oscillating frequency active (650Hz – 1250Hz)'
            : 'Press button to begin high-pitch deterrent alarm.'}
        </p>
      </div>

      {/* Volume Slider Card */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#5B214C] dark:text-[#C773B1]" />
            <span>Master Volume</span>
          </span>
          <span className="font-mono text-[#5B214C] dark:text-[#C773B1]">
            {Math.round(volume * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full accent-[#E53945] cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-[#746B77] dark:text-[#AFA5B4]">
          <span>Muted</span>
          <span>Max Speaker Output</span>
        </div>
      </div>

      {/* Zero Server Offline Guarantee */}
      <div className="p-3 rounded-2xl bg-[#FFF9FB] dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] text-xs text-[#746B77] dark:text-[#AFA5B4] flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-[#17865D] shrink-0 mt-0.5" />
        <div>
          <strong>Web Audio API:</strong> Tone waveform is generated mathematically on the audio hardware. Works in airplane mode or with no connectivity whatsoever.
        </div>
      </div>
    </div>
  )
}
