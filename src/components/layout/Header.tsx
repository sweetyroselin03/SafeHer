import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Settings, Wifi, WifiOff, Battery, BatteryCharging, Moon, Sun } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useBattery } from '../../hooks/useBattery'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export const Header: React.FC = () => {
  const profile = useAppStore(state => state.profile)
  const settings = useAppStore(state => state.settings)
  const toggleDarkMode = useAppStore(state => state.toggleDarkMode)
  const battery = useBattery()
  const isOnline = useOnlineStatus()
  const navigate = useNavigate()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#F7DDE7]/60 dark:border-[#3D2336] bg-[#FFF9FB]/95 dark:bg-[#140D17]/95 backdrop-blur-md transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B214C] to-[#3D1232] flex items-center justify-center text-white shadow-md shadow-[#5B214C]/20 transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5 text-[#FF5E6C]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#5B214C] dark:text-[#C773B1]">SafeHer</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#F7DDE7] dark:bg-[#3D2336] text-[#5B214C] dark:text-[#F7DDE7]">
                PWA
              </span>
            </div>
            <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
              {getGreeting()}{profile.displayName ? `, ${profile.displayName}` : ''}
            </p>
          </div>
        </Link>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Pill */}
          <div
            title={isOnline ? 'Online: External sharing ready' : 'Offline: Local safety features active'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              isOnline
                ? 'bg-[#17865D]/10 text-[#17865D] dark:bg-[#17865D]/20 dark:text-[#2CD69A]'
                : 'bg-[#E9A23B]/15 text-[#E9A23B] dark:bg-[#E9A23B]/25'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Battery Status (genuine browser detection) */}
          {battery.isSupported && (
            <div
              title={`Battery: ${battery.level}% ${battery.charging ? '(Charging)' : ''}`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                battery.level <= 15
                  ? 'bg-[#E53945]/15 text-[#E53945]'
                  : 'bg-black/5 dark:bg-white/10 text-[#746B77] dark:text-[#AFA5B4]'
              }`}
            >
              {battery.charging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-[#17865D]" />
              ) : (
                <Battery className="w-3.5 h-3.5" />
              )}
              <span>{battery.level}%</span>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-[#746B77] dark:text-[#AFA5B4] hover:bg-[#F7DDE7]/50 dark:hover:bg-[#3D2336]/60 transition-colors focus:outline-none"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-[#F5B853]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Shortcut */}
          <button
            onClick={() => navigate('/settings')}
            aria-label="Open settings"
            className="p-2 rounded-xl text-[#746B77] dark:text-[#AFA5B4] hover:bg-[#F7DDE7]/50 dark:hover:bg-[#3D2336]/60 transition-colors focus:outline-none"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
