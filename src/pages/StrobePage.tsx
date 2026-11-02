import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, AlertTriangle, EyeOff, ShieldAlert, X } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { IncidentService } from '../services/incidentService'

export const StrobePage: React.FC = () => {
  const navigate = useNavigate()
  const settings = useAppStore(state => state.settings)
  const setSettings = useAppStore(state => state.setSettings)
  const refreshIncidents = useAppStore(state => state.refreshIncidents)

  const [isActive, setIsActive] = useState(false)
  const [allowFlashing, setAllowFlashing] = useState(settings.allowFlashingStrobe || false)
  const [warningConfirmed, setWarningConfirmed] = useState(false)

  useEffect(() => {
    return () => {
      setIsActive(false)
    }
  }, [])

  const startStrobe = () => {
    if (!allowFlashing && !warningConfirmed) {
      alert('Please review and acknowledge the seizure safety notice before activating flashing mode.')
      return
    }
    setIsActive(true)
    IncidentService.logEvent('strobe_activated', 'completed')
    refreshIncidents()
  }

  const stopStrobe = () => {
    setIsActive(false)
  }

  // --- FULL SCREEN STROBE SCREEN ---
  if (isActive) {
    return (
      <div
        onClick={stopStrobe}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 select-none cursor-pointer ${
          allowFlashing && !settings.reducedMotion
            ? 'animate-strobe'
            : 'bg-[#E53945] text-white'
        }`}
      >
        <div className="pt-8 text-center">
          <ShieldAlert className="w-16 h-16 mx-auto mb-2" />
          <h1 className="text-3xl font-black uppercase tracking-wider">EMERGENCY VISUAL SIGNAL</h1>
        </div>

        <div className="text-center font-extrabold text-lg uppercase tracking-widest bg-black/40 text-white px-6 py-3 rounded-full backdrop-blur-md">
          TAP ANYWHERE TO STOP
        </div>

        <div className="pb-8 text-xs font-mono opacity-80">
          SafeHer Optical Beacon
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in pb-12">
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
            <Zap className="w-5 h-5 text-amber-500" />
            <span>Visual Emergency Strobe</span>
          </h1>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            High-contrast visual beacon to signal nearby help in the dark.
          </p>
        </div>
      </div>

      {/* Epilepsy & Health Safety Warning */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Photosensitivity & Seizure Warning</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Alternating high-frequency flash patterns can trigger seizures in individuals with photosensitive epilepsy. SafeHer defaults to a steady, non-flashing emergency signal.
        </p>

        <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-[11px]">
          <input
            type="checkbox"
            checked={allowFlashing}
            onChange={(e) => {
              setAllowFlashing(e.target.checked)
              setSettings({ allowFlashingStrobe: e.target.checked })
              if (e.target.checked) setWarningConfirmed(true)
            }}
            className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
          />
          <span>I understand and opt-in to high-contrast rapid flash mode</span>
        </label>
      </div>

      {/* Main Activation Card */}
      <div className="bg-white dark:bg-[#1E1423] p-6 rounded-3xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Zap className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-base font-bold text-[#241B28] dark:text-[#F7F3F8]">
            {allowFlashing ? 'Rapid Flashing Strobe' : 'High-Contrast Emergency Beacon'}
          </h2>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mt-1">
            {allowFlashing
              ? 'Screen will alternate between full red and white.'
              : 'Screen will display a continuous bright high-visibility emergency red surface.'}
          </p>
        </div>

        <button
          type="button"
          onClick={startStrobe}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 hover:opacity-95 transition-opacity"
        >
          Launch Visual Beacon
        </button>
      </div>
    </div>
  )
}
