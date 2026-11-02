import React, { useState, useEffect } from 'react'
import {
  Settings,
  User,
  Shield,
  Sliders,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { StorageService } from '../services/storageService'
import { MotionService } from '../services/motionService'

export const SettingsPage: React.FC = () => {
  const profile = useAppStore(state => state.profile)
  const setProfile = useAppStore(state => state.setProfile)
  const settings = useAppStore(state => state.settings)
  const setSettings = useAppStore(state => state.setSettings)
  const permissions = useAppStore(state => state.permissions)
  const checkPermissions = useAppStore(state => state.checkPermissions)
  const resetAllData = useAppStore(state => state.resetAllData)

  // Local form state
  const [name, setName] = useState(profile.displayName || '')
  const [emergencyNote, setEmergencyNote] = useState(profile.emergencyNote || '')
  const [emergencyNumber, setEmergencyNumber] = useState(settings.emergencyNumber || '112')
  const [shakeThreshold, setShakeThreshold] = useState(settings.shakeThreshold || 22)
  const [sosHoldDuration, setSosHoldDuration] = useState(settings.sosHoldDuration || 1500)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Live shake calibration state
  const [currentMagnitude, setCurrentMagnitude] = useState(0)

  useEffect(() => {
    checkPermissions()

    const unreg = MotionService.subscribeDebug((mag) => {
      setCurrentMagnitude(Math.round(mag))
    })

    return () => {
      unreg()
    }
  }, [checkPermissions])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile({
      displayName: name.trim(),
      emergencyNote: emergencyNote.trim(),
    })
    setSettings({
      emergencyNumber: emergencyNumber.trim() || '112',
      shakeThreshold,
      sosHoldDuration,
    })
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportData = () => {
    const dataStr = StorageService.exportAllData()
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SafeHer_Full_Data_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const success = StorageService.importData(text)
        if (success) {
          window.location.reload()
        } else {
          alert('Failed to parse backup JSON.')
        }
      } catch (err) {
        alert('Invalid JSON backup file.')
      }
    }
    reader.readAsText(file)
  }

  const handleResetData = () => {
    if (window.confirm('CAUTION: This will permanently delete your contacts, profile, and incident history from this browser. Continue?')) {
      resetAllData()
      alert('SafeHer has been completely reset.')
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5B214C] dark:text-[#C773B1]" />
          <span>Settings & Privacy</span>
        </h1>
        <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
          Zero-server personal configurations & sensor calibrations.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-[#17865D]/15 border border-[#17865D]/30 text-xs font-semibold text-[#17865D] dark:text-[#2CD69A] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile & safety preferences updated!</span>
        </div>
      )}

      {/* 1. Profile & Emergency Note Card */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-1.5">
          <User className="w-4 h-4 text-[#5B214C] dark:text-[#C773B1]" />
          <span>Profile & Emergency Medical Note</span>
        </h2>

        <div>
          <label className="block text-[11px] font-semibold text-[#746B77] dark:text-[#AFA5B4] mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maya Patel"
            className="w-full px-3 py-2 rounded-xl text-xs border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#746B77] dark:text-[#AFA5B4] mb-1">
            Emergency Note (Appended to WhatsApp SOS message)
          </label>
          <textarea
            rows={2}
            value={emergencyNote}
            onChange={(e) => setEmergencyNote(e.target.value)}
            placeholder="e.g. Severe peanut allergy. Blood group: B+. Asthmatic."
            className="w-full px-3 py-2 rounded-xl text-xs border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#746B77] dark:text-[#AFA5B4] mb-1">
            Emergency Call Shortcut Number
          </label>
          <input
            type="text"
            value={emergencyNumber}
            onChange={(e) => setEmergencyNumber(e.target.value)}
            placeholder="112"
            className="w-full px-3 py-2 rounded-xl text-xs border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] font-mono focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#5B214C] dark:bg-[#C773B1] text-white dark:text-[#140D17] font-bold text-xs shadow hover:opacity-95"
        >
          Save Profile Updates
        </button>
      </form>

      {/* 2. Safety Preferences & Sensor Calibrations */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-[#5B214C] dark:text-[#C773B1]" />
          <span>Safety Preferences & Calibration</span>
        </h2>

        {/* Shake-to-SOS Toggle */}
        <div className="space-y-2 pt-1 border-t border-[#F7DDE7]/50 dark:border-[#3D2336]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
                Shake-to-SOS Trigger
              </div>
              <div className="text-[11px] text-[#746B77] dark:text-[#AFA5B4]">
                Triggers emergency screen when vigorously shaken
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.shakeEnabled}
              onChange={async (e) => {
                if (e.target.checked) {
                  await MotionService.requestPermission()
                }
                setSettings({ shakeEnabled: e.target.checked })
              }}
              className="w-5 h-5 rounded text-[#5B214C] accent-[#5B214C] cursor-pointer"
            />
          </div>

          {settings.shakeEnabled && (
            <div className="p-3 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold">Acceleration Threshold:</span>
                <span className="font-mono">{shakeThreshold} m/s²</span>
              </div>
              <input
                type="range"
                min="12"
                max="40"
                step="1"
                value={shakeThreshold}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setShakeThreshold(val)
                  setSettings({ shakeThreshold: val })
                }}
                className="w-full accent-[#5B214C] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#746B77] dark:text-[#AFA5B4]">
                <span>Sensitive (12)</span>
                <span>Firm Shake (25)</span>
                <span>Vigorous (40)</span>
              </div>

              {/* Live Magnitude Sensor Test */}
              <div className="pt-2 border-t border-[#F7DDE7]/50 dark:border-[#3D2336] flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-[#746B77] dark:text-[#AFA5B4]">
                  <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>Live Acceleration:</span>
                </span>
                <span className={`font-mono font-bold ${currentMagnitude >= shakeThreshold ? 'text-[#E53945]' : 'text-[#17865D]'}`}>
                  {currentMagnitude} m/s²
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SOS Button Hold Duration */}
        <div className="space-y-1.5 pt-2 border-t border-[#F7DDE7]/50 dark:border-[#3D2336]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#241B28] dark:text-[#F7F3F8]">
              SOS Hold Duration
            </span>
            <span className="font-mono text-[#5B214C] dark:text-[#C773B1]">
              {(sosHoldDuration / 1000).toFixed(1)}s
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1000, 1500, 2000, 3000].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => {
                  setSosHoldDuration(dur)
                  setSettings({ sosHoldDuration: dur })
                }}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sosHoldDuration === dur
                    ? 'bg-[#5B214C] text-white'
                    : 'bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] text-[#746B77]'
                }`}
              >
                {(dur / 1000).toFixed(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility: Reduced Motion */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F7DDE7]/50 dark:border-[#3D2336]">
          <div>
            <div className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
              Reduced Motion
            </div>
            <div className="text-[11px] text-[#746B77] dark:text-[#AFA5B4]">
              Disables pulsing ripples & flashes for vestibular comfort
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => setSettings({ reducedMotion: e.target.checked })}
            className="w-5 h-5 rounded text-[#5B214C] accent-[#5B214C] cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Permission Center */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-2.5">
        <h2 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#17865D]" />
          <span>Device Hardware Permissions</span>
        </h2>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Geolocation API</div>
            <div className="font-bold capitalize text-[#17865D]">{permissions.geolocation}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Microphone Media</div>
            <div className="font-bold capitalize text-[#7C3AED]">{permissions.microphone}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Motion Accelerometer</div>
            <div className="font-bold capitalize text-blue-500">{permissions.motion}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Audio Synthesizer</div>
            <div className="font-bold text-[#17865D]">Web Audio Active</div>
          </div>
        </div>

        <p className="text-[10px] text-[#746B77] dark:text-[#AFA5B4] pt-1">
          To modify permissions, tap the padlock / site settings icon in your browser address bar.
        </p>
      </div>

      {/* 4. Privacy, Backups & Data Reset */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-[#5B214C] dark:text-[#C773B1]" />
          <span>Privacy & Data Management</span>
        </h2>

        <p className="text-[11px] text-[#746B77] dark:text-[#AFA5B4]">
          SafeHer maintains a strict zero-cloud architecture. All profiles, contacts, and history reside purely within this browser profile.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex-1 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F7DDE7]/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="flex-1 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#F7DDE7]/40 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleResetData}
          className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-[#E53945] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All SafeHer Data & Reset</span>
        </button>
      </div>
    </div>
  )
}
