import { BatteryState } from '../types'

interface BatteryManager extends EventTarget {
  charging: boolean
  chargingTime: number
  dischargingTime: number
  level: number
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void
}

export class BatteryService {
  private static batteryManager: BatteryManager | null = null
  private static listeners: Set<(state: BatteryState) => void> = new Set()

  static isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      'getBattery' in navigator &&
      typeof (navigator as unknown as { getBattery: unknown }).getBattery === 'function'
    )
  }

  static async init(): Promise<BatteryState> {
    if (!this.isSupported()) {
      return {
        isSupported: false,
        level: 0,
        charging: false,
        chargingTime: 0,
        dischargingTime: 0,
      }
    }

    try {
      // @ts-expect-error navigator.getBattery API
      this.batteryManager = await navigator.getBattery()

      if (this.batteryManager) {
        this.batteryManager.addEventListener('levelchange', this.handleChange)
        this.batteryManager.addEventListener('chargingchange', this.handleChange)
      }

      return this.getState()
    } catch (e) {
      console.warn('Battery API failed to initialize', e)
      return {
        isSupported: false,
        level: 0,
        charging: false,
        chargingTime: 0,
        dischargingTime: 0,
      }
    }
  }

  static getState(): BatteryState {
    if (!this.batteryManager) {
      return {
        isSupported: false,
        level: 0,
        charging: false,
        chargingTime: 0,
        dischargingTime: 0,
      }
    }

    return {
      isSupported: true,
      level: Math.round(this.batteryManager.level * 100),
      charging: this.batteryManager.charging,
      chargingTime: this.batteryManager.chargingTime,
      dischargingTime: this.batteryManager.dischargingTime,
    }
  }

  static subscribe(cb: (state: BatteryState) => void): () => void {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  private static handleChange = () => {
    const state = this.getState()
    this.listeners.forEach(cb => cb(state))
  }
}
