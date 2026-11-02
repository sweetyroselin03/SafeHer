import { useEffect } from 'react'
import { useAppStore } from '../store/useAppStore'
import { BatteryService } from '../services/batteryService'

export function useBattery() {
  const battery = useAppStore(state => state.battery)
  const setBattery = useAppStore(state => state.setBattery)

  useEffect(() => {
    BatteryService.init().then(initialState => {
      setBattery(initialState)
    })

    const unsubscribe = BatteryService.subscribe(updatedState => {
      setBattery(updatedState)
    })

    return () => {
      unsubscribe()
    }
  }, [setBattery])

  return battery
}
