import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PhoneCall,
  Volume2,
  Mic,
  MapPin,
  Users,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { SOSButton } from '../components/emergency/SOSButton'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useBattery } from '../hooks/useBattery'
import { usePWAInstall } from '../hooks/usePWAInstall'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const contacts = useAppStore(state => state.contacts)
  const profile = useAppStore(state => state.profile)
  const isOnline = useOnlineStatus()
  const battery = useBattery()
  const { isInstallable, promptInstall } = usePWAInstall()

  // Redirect to welcome/onboarding if first-time user
  useEffect(() => {
    if (!profile.onboardingCompleted) {
      navigate('/welcome')
    }
  }, [profile.onboardingCompleted, navigate])

  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0]

  const quickActions = [
    {
      title: 'Fake Call',
      desc: 'Simulate realistic incoming call',
      icon: PhoneCall,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
      action: () => navigate('/fake-call'),
    },
    {
      title: 'Emergency Siren',
      desc: 'Piercing acoustic alarm synthesizer',
      icon: Volume2,
      color: 'from-red-500 to-rose-600',
      textColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-900/50',
      action: () => navigate('/siren'),
    },
    {
      title: 'Audio Recorder',
      desc: 'Capture local audio evidence',
      icon: Mic,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-900/50',
      action: () => navigate('/recorder'),
    },
    {
      title: 'Share Location',
      desc: 'Direct GPS broadcast to contacts',
      icon: MapPin,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
      action: () => navigate('/sos'),
    },
    {
      title: 'Emergency Contacts',
      desc: `${contacts.length} saved trusted contact${contacts.length === 1 ? '' : 's'}`,
      icon: Users,
      color: 'from-[#5B214C] to-[#7A2D66]',
      textColor: 'text-[#5B214C] dark:text-[#C773B1]',
      bgColor: 'bg-[#F7DDE7]/40 dark:bg-[#3D2336]/30',
      borderColor: 'border-[#F7DDE7] dark:border-[#3D2336]',
      action: () => navigate('/contacts'),
    },
    {
      title: 'Safety History',
      desc: 'View local verifiable incident logs',
      icon: Clock,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
      action: () => navigate('/history'),
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* PWA Install Banner */}
      {isInstallable && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#5B214C] to-[#7A2D66] text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#FF5E6C]" />
            <div>
              <div className="text-xs font-bold">Install SafeHer App</div>
              <div className="text-[10px] opacity-90">One-tap offline access from your home screen</div>
            </div>
          </div>
          <button
            onClick={() => promptInstall()}
            className="px-3 py-1.5 rounded-xl bg-white text-[#5B214C] text-xs font-bold shadow hover:bg-slate-100 transition-colors"
          >
            Install
          </button>
        </div>
      )}

      {/* Safety Status Card */}
      <section className="bg-white dark:bg-[#1E1423] rounded-2xl p-4 border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#17865D]" />
            <h2 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8]">Safety Guard Active</h2>
          </div>
          <span className="text-[11px] font-semibold text-[#17865D] bg-[#17865D]/10 px-2 py-0.5 rounded-full">
            Zero-Server Ready
          </span>
        </div>

        {/* Status Indicators Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/60 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Primary Contact</div>
            <div className="font-semibold truncate text-[#5B214C] dark:text-[#C773B1]">
              {primaryContact ? primaryContact.name : 'None configured'}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/60 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Network</div>
            <div className="font-semibold flex items-center gap-1">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-[#17865D]" />
                  <span className="text-[#17865D]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-[#E9A23B]" />
                  <span className="text-[#E9A23B]">Offline Cache</span>
                </>
              )}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/60 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Battery Monitor</div>
            <div className="font-semibold">
              {battery.isSupported ? `${battery.level}%` : 'Unsupported'}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/60 dark:border-[#3D2336]">
            <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Local Evidence</div>
            <div className="font-semibold flex items-center gap-1 text-[#17865D]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Encrypted-like</span>
            </div>
          </div>
        </div>

        {/* Warning if no contacts */}
        {contacts.length === 0 && (
          <div
            onClick={() => navigate('/contacts')}
            className="mt-3 p-2.5 rounded-xl bg-[#E9A23B]/10 border border-[#E9A23B]/30 flex items-center justify-between text-xs cursor-pointer hover:bg-[#E9A23B]/15 transition-colors"
          >
            <div className="flex items-center gap-2 text-[#B45309] dark:text-[#F5B853]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>No emergency contacts saved yet! Tap to configure.</span>
            </div>
            <span className="font-bold underline text-[#B45309] dark:text-[#F5B853]">Add</span>
          </div>
        )}
      </section>

      {/* Main SOS Trigger Center */}
      <section className="bg-white dark:bg-[#1E1423] rounded-3xl p-6 border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm flex flex-col items-center justify-center text-center">
        <SOSButton />
      </section>

      {/* Quick Safety Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8]">Quick Safety Tools</h2>
          <span className="text-xs text-[#746B77] dark:text-[#AFA5B4]">Instant access</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.title}
                type="button"
                onClick={item.action}
                className={`p-3.5 rounded-2xl border ${item.borderColor} ${item.bgColor} flex flex-col items-start text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm focus:outline-none`}
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md mb-2`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#746B77] dark:text-[#AFA5B4] line-clamp-1 mt-0.5">
                  {item.desc}
                </p>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
