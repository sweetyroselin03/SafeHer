import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'

export function useOnlineStatus() {
  const isOnline = useAppStore(state => state.isOnline)
  const setIsOnline = useAppStore(state => state.setIsOnline)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setIsOnline])

  return isOnline
}
