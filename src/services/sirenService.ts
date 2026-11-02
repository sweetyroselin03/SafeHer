export class SirenService {
  private static audioCtx: AudioContext | null = null
  private static oscillator: OscillatorNode | null = null
  private static gainNode: GainNode | null = null
  private static isPlaying = false
  private static sirenTimer: number | null = null
  private static currentVolume = 0.8

  /**
   * Safe AudioContext initializer
   */
  private static initAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioCtx = new AudioContextClass()
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume()
    }
    return this.audioCtx
  }

  static getIsPlaying(): boolean {
    return this.isPlaying
  }

  static setVolume(volume: number): void {
    this.currentVolume = Math.max(0.05, Math.min(1.0, volume))
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.audioCtx.currentTime)
    }
  }

  /**
   * Starts high-intensity oscillating emergency siren
   */
  static start(volume?: number): boolean {
    if (typeof window === 'undefined') return false
    if (this.isPlaying) return true

    try {
      const ctx = this.initAudioContext()
      if (volume !== undefined) {
        this.currentVolume = volume
      }

      // Create oscillator and gain
      this.oscillator = ctx.createOscillator()
      this.gainNode = ctx.createGain()

      // High visibility sawtooth wave for piercing alarm tone
      this.oscillator.type = 'sawtooth'
      this.gainNode.gain.setValueAtTime(this.currentVolume, ctx.currentTime)

      this.oscillator.connect(this.gainNode)
      this.gainNode.connect(ctx.destination)

      this.oscillator.start()
      this.isPlaying = true

      // Frequency modulation cycle: oscillate between 650Hz and 1250Hz every 0.8s
      let goingUp = true
      const cycleFrequency = () => {
        if (!this.isPlaying || !this.oscillator || !this.audioCtx) return

        const now = this.audioCtx.currentTime
        const targetFreq = goingUp ? 1250 : 650
        const duration = 0.55

        this.oscillator.frequency.cancelScheduledValues(now)
        this.oscillator.frequency.linearRampToValueAtTime(targetFreq, now + duration)

        goingUp = !goingUp
      }

      cycleFrequency()
      this.sirenTimer = window.setInterval(cycleFrequency, 550)

      return true
    } catch (e) {
      console.error('Failed to start siren via Web Audio API', e)
      return false
    }
  }

  /**
   * Stops the siren and disconnects audio nodes
   */
  static stop(): void {
    if (this.sirenTimer !== null) {
      clearInterval(this.sirenTimer)
      this.sirenTimer = null
    }

    if (this.oscillator) {
      try {
        this.oscillator.stop()
        this.oscillator.disconnect()
      } catch (e) {
        // Ignore if already stopped
      }
      this.oscillator = null
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect()
      } catch (e) {
        // Ignore
      }
      this.gainNode = null
    }

    this.isPlaying = false
  }
}
