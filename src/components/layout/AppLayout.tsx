import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useShakeDetection } from '../../hooks/useShakeDetection'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { WifiOff, AlertTriangle } from 'lucide-react'

export const AppLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isOnline = useOnlineStatus()

  // Global shake detection: redirects directly to /sos when shaken
  useShakeDetection(() => {
    if (location.pathname !== '/sos') {
      navigate('/sos')
    }
  })

  // Hide bottom nav during fake call simulation to make it completely realistic
  const isFakeCallActive = location.pathname.startsWith('/fake-call')

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9FB] dark:bg-[#140D17] text-[#241B28] dark:text-[#F7F3F8] transition-colors">
      {!isFakeCallActive && <Header />}

      {/* Offline Alert Strip (Only appears when offline) */}
      {!isOnline && !isFakeCallActive && (
        <div className="bg-[#E9A23B]/15 border-b border-[#E9A23B]/30 px-4 py-2 text-xs text-[#B45309] dark:text-[#F5B853] flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            <strong>Offline Mode:</strong> Emergency Siren, Fake Call, Audio Recording, and Cached Location remain fully active. External WhatsApp sending requires cellular/Wi-Fi signal.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-4xl w-full mx-auto px-4 py-4 ${!isFakeCallActive ? 'pb-24' : ''}`}>
        <Outlet />
      </main>

      {!isFakeCallActive && <BottomNav />}
    </div>
  )
}
