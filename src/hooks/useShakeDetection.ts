import { useEffect, useState, useCallback } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MotionService } from '../services/motionService'

export function useShakeDetection(onShakeTriggered?: () => void) {
  const settings = useAppStore(state => state.settings)
  const [isSupported, setIsSupported] = useState(false)
  const [currentMagnitude, setCurrentMagnitude] = useState(0)
  const [shakeCount, setShakeCount] = useState(0)

  useEffect(() => {
    setIsSupported(MotionService.isSupported())
  }, [])

  useEffect(() => {
    if (!settings.shakeEnabled) {
      MotionService.stop()
      return
    }

    MotionService.configure({
      threshold: settings.shakeThreshold,
      cooldownMs: settings.shakeCooldown,
      requiredShakes: 2,
    })

    MotionService.start()

    const unregTrigger = MotionService.subscribe((_mag) => {
      if (onShakeTriggered) {
        onShakeTriggered()
      }
    })

    const unregDebug = MotionService.subscribeDebug((mag, count) => {
      setCurrentMagnitude(mag)
      setShakeCount(count)
    })

    return () => {
      unregTrigger()
      unregDebug()
      MotionService.stop()
    }
  }, [settings.shakeEnabled, settings.shakeThreshold, settings.shakeCooldown, onShakeTriggered])

  const requestPermission = useCallback(async () => {
    return await MotionService.requestPermission()
  }, [])

  return {
    isSupported,
    isEnabled: settings.shakeEnabled,
    currentMagnitude,
    shakeCount,
    requestPermission,
  }
}
