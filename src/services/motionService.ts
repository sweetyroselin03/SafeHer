export interface ShakeOptions {
  threshold: number // acceleration magnitude in m/s^2 (e.g. 20-30)
  cooldownMs: number // Cooldown between trigger events
  requiredShakes: number // Number of distinct directional shakes required
  windowMs: number // Time window to count required shakes
}

export type ShakeListener = (magnitude: number) => void
export type MotionDebugListener = (magnitude: number, shakeCount: number) => void

export class MotionService {
  private static isListening = false
  private static listeners: Set<ShakeListener> = new Set()
  private static debugListeners: Set<MotionDebugListener> = new Set()
  private static lastShakeTimestamp = 0
  private static shakeTimestamps: number[] = []

  private static currentOptions: ShakeOptions = {
    threshold: 22,
    cooldownMs: 3000,
    requiredShakes: 2,
    windowMs: 1200,
  }

  /**
   * Checks if DeviceMotionEvent is supported on the current browser/device
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window
  }

  /**
   * Request permission for iOS 13+ devices
   */
  static async requestPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
    if (!this.isSupported()) {
      return 'unsupported'
    }

    // iOS 13+ requires explicit user gesture permission request
    // @ts-expect-error DeviceMotionEvent.requestPermission is iOS specific
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        // @ts-expect-error iOS DeviceMotionEvent
        const response = await DeviceMotionEvent.requestPermission()
        return response === 'granted' ? 'granted' : 'denied'
      } catch (e) {
        console.warn('DeviceMotionEvent permission error:', e)
        return 'denied'
      }
    }

    // Standard Android / Desktop Chrome does not need requestPermission
    return 'granted'
  }

  static configure(options: Partial<ShakeOptions>): void {
    this.currentOptions = { ...this.currentOptions, ...options }
  }

  static start(options?: Partial<ShakeOptions>): boolean {
    if (!this.isSupported()) return false
    if (options) this.configure(options)

    if (!this.isListening) {
      window.addEventListener('devicemotion', this.handleMotion, { passive: true })
      this.isListening = true
    }
    return true
  }

  static stop(): void {
    if (this.isListening) {
      window.removeEventListener('devicemotion', this.handleMotion)
      this.isListening = false
      this.shakeTimestamps = []
    }
  }

  static subscribe(listener: ShakeListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  static subscribeDebug(listener: MotionDebugListener): () => void {
    this.debugListeners.add(listener)
    return () => {
      this.debugListeners.delete(listener)
    }
  }

  private static handleMotion = (event: DeviceMotionEvent) => {
    // Prefer pure acceleration without gravity; fallback to accelerationIncludingGravity
    const acc = event.acceleration || event.accelerationIncludingGravity
    if (!acc) return

    const x = acc.x || 0
    const y = acc.y || 0
    const z = acc.z || 0

    // Compute 3D acceleration vector magnitude
    let magnitude = Math.sqrt(x * x + y * y + z * z)

    // If using accelerationIncludingGravity, adjust for roughly 9.8 m/s^2 earth gravity
    if (!event.acceleration && event.accelerationIncludingGravity) {
      magnitude = Math.max(0, magnitude - 9.8)
    }

    const now = Date.now()

    // Notify debug listeners of raw magnitude
    this.debugListeners.forEach(cb => cb(magnitude, this.shakeTimestamps.length))

    // Check if magnitude exceeds user-calibrated threshold
    if (magnitude >= this.currentOptions.threshold) {
      // Check cooldown from previous activation
      if (now - this.lastShakeTimestamp < this.currentOptions.cooldownMs) {
        return
      }

      // Filter timestamps within current detection window
      this.shakeTimestamps = this.shakeTimestamps.filter(
        t => now - t <= this.currentOptions.windowMs
      )
      this.shakeTimestamps.push(now)

      // Notify debug listeners with updated shake count
      this.debugListeners.forEach(cb => cb(magnitude, this.shakeTimestamps.length))

      // If required distinct shakes occurred in window
      if (this.shakeTimestamps.length >= this.currentOptions.requiredShakes) {
        this.lastShakeTimestamp = now
        this.shakeTimestamps = []

        // Trigger shake listeners
        this.listeners.forEach(cb => cb(magnitude))
      }
    }
  }
}
