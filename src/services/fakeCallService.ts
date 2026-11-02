export class FakeCallService {
  private static audioCtx: AudioContext | null = null
  private static ringOsc1: OscillatorNode | null = null
  private static ringOsc2: OscillatorNode | null = null
  private static ringGain: GainNode | null = null
  private static cadenceTimer: number | null = null
  private static isRinging = false
  private static vibrationInterval: number | null = null

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

  /**
   * Starts realistic dual-tone phone ringing (440Hz + 480Hz) with vibration
   */
  static startRinging(): void {
    if (this.isRinging) return
    this.isRinging = true

    // Start vibration cadence if supported
    this.startVibration()

    try {
      const ctx = this.initAudioContext()
      
      const playToneBurst = () => {
        if (!this.isRinging) return

        this.ringOsc1 = ctx.createOscillator()
        this.ringOsc2 = ctx.createOscillator()
        this.ringGain = ctx.createGain()

        // Standard telecom ring frequencies: 440Hz and 480Hz
        this.ringOsc1.frequency.value = 440
        this.ringOsc2.frequency.value = 480

        this.ringGain.gain.setValueAtTime(0.3, ctx.currentTime)

        this.ringOsc1.connect(this.ringGain)
        this.ringOsc2.connect(this.ringGain)
        this.ringGain.connect(ctx.destination)

        this.ringOsc1.start()
        this.ringOsc2.start()

        // Ring for 1.8 seconds, then silent for 2.2 seconds
        setTimeout(() => {
          this.stopToneBurst()
        }, 1800)
      }

      playToneBurst()
      this.cadenceTimer = window.setInterval(playToneBurst, 4000)
    } catch (e) {
      console.warn('Audio ringtone tone burst failed', e)
    }
  }

  private static stopToneBurst(): void {
    if (this.ringOsc1) {
      try { this.ringOsc1.stop(); this.ringOsc1.disconnect() } catch (e) { /* ignore */ }
      this.ringOsc1 = null
    }
    if (this.ringOsc2) {
      try { this.ringOsc2.stop(); this.ringOsc2.disconnect() } catch (e) { /* ignore */ }
      this.ringOsc2 = null
    }
    if (this.ringGain) {
      try { this.ringGain.disconnect() } catch (e) { /* ignore */ }
      this.ringGain = null
    }
  }

  static stopRinging(): void {
    this.isRinging = false
    if (this.cadenceTimer !== null) {
      clearInterval(this.cadenceTimer)
      this.cadenceTimer = null
    }
    this.stopToneBurst()
    this.stopVibration()
  }

  private static startVibration(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([800, 400, 800, 1500])
      this.vibrationInterval = window.setInterval(() => {
        if (this.isRinging && navigator.vibrate) {
          navigator.vibrate([800, 400, 800, 1500])
        }
      }, 3500)
    }
  }

  private static stopVibration(): void {
    if (this.vibrationInterval !== null) {
      clearInterval(this.vibrationInterval)
      this.vibrationInterval = null
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(0)
    }
  }

  /**
   * Generates simulated caller speech response using browser speech synthesis
   * without needing any network connection.
   */
  static playSimulatedVoice(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel() // clear any queued speech
        const utterances = [
          "Hey! Where are you right now? I'm waiting nearby with the car.",
          "Are you coming down the road? Keep talking to me, I'm right here.",
          "Yeah, just stay on the call with me while you walk over.",
          "I can see the corner from here. Keep walking towards the main light."
        ]

        let delay = 600
        utterances.forEach(text => {
          setTimeout(() => {
            if ('speechSynthesis' in window) {
              const u = new SpeechSynthesisUtterance(text)
              u.rate = 1.0
              u.pitch = 1.05
              window.speechSynthesis.speak(u)
            }
          }, delay)
          delay += 6000
        })
      } catch (e) {
        console.warn('Speech synthesis simulation failed', e)
      }
    }
  }

  static stopSimulatedVoice(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  static cleanup(): void {
    this.stopRinging()
    this.stopSimulatedVoice()
  }
}
