import { IndexedDBService } from './indexedDBService'
import { AudioEvidenceMetadata } from '../types'

export type RecorderState = 'inactive' | 'recording' | 'paused'

export class RecordingService {
  private static mediaRecorder: MediaRecorder | null = null
  private static audioStream: MediaStream | null = null
  private static recordedChunks: Blob[] = []
  private static startTime = 0
  private static pausedTime = 0
  private static totalPausedDuration = 0
  private static durationTimer: number | null = null
  private static onStateChangeCb: ((state: RecorderState, durationSec: number) => void) | null = null
  private static mimeType = 'audio/webm'

  /**
   * Determine the most compatible audio mime type supported by the browser
   */
  static getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm'

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ]

    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t
      }
    }
    return ''
  }

  static getState(): RecorderState {
    if (!this.mediaRecorder) return 'inactive'
    return this.mediaRecorder.state as RecorderState
  }

  static setListener(cb: (state: RecorderState, durationSec: number) => void): void {
    this.onStateChangeCb = cb
  }

  static getDurationSeconds(): number {
    if (!this.startTime) return 0
    const now = this.mediaRecorder?.state === 'paused' ? this.pausedTime : Date.now()
    return Math.max(0, Math.floor((now - this.startTime - this.totalPausedDuration) / 1000))
  }

  /**
   * Start microphone recording
   */
  static async startRecording(incidentId?: string): Promise<boolean> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return true
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone recording is not supported on this device/browser.')
    }

    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      this.mimeType = this.getSupportedMimeType()
      const options: MediaRecorderOptions = this.mimeType ? { mimeType: this.mimeType } : {}

      this.mediaRecorder = new MediaRecorder(this.audioStream, options)
      this.recordedChunks = []
      this.startTime = Date.now()
      this.pausedTime = 0
      this.totalPausedDuration = 0

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(250) // collect chunks every 250ms

      // Start duration ticker
      this.durationTimer = window.setInterval(() => {
        if (this.onStateChangeCb && this.mediaRecorder?.state === 'recording') {
          this.onStateChangeCb('recording', this.getDurationSeconds())
        }
      }, 500)

      if (this.onStateChangeCb) {
        this.onStateChangeCb('recording', 0)
      }

      return true
    } catch (err) {
      console.error('Failed to start recording', err)
      this.cleanupStream()
      throw err
    }
  }

  static pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      this.pausedTime = Date.now()
      if (this.onStateChangeCb) {
        this.onStateChangeCb('paused', this.getDurationSeconds())
      }
    }
  }

  static resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.totalPausedDuration += Date.now() - this.pausedTime
      this.mediaRecorder.resume()
      if (this.onStateChangeCb) {
        this.onStateChangeCb('recording', this.getDurationSeconds())
      }
    }
  }

  /**
   * Stop recording, assemble audio Blob, and persist to IndexedDB
   */
  static async stopRecording(incidentId?: string): Promise<AudioEvidenceMetadata | null> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return null
    }

    const duration = this.getDurationSeconds()

    if (this.durationTimer !== null) {
      clearInterval(this.durationTimer)
      this.durationTimer = null
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        resolve(null)
        return
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const finalMime = this.mimeType || 'audio/webm'
          const blob = new Blob(this.recordedChunks, { type: finalMime })
          
          this.cleanupStream()
          this.recordedChunks = []
          this.mediaRecorder = null

          if (this.onStateChangeCb) {
            this.onStateChangeCb('inactive', duration)
          }

          if (blob.size === 0) {
            resolve(null)
            return
          }

          // Persist directly to IndexedDB
          const savedMetadata = await IndexedDBService.saveRecording(blob, duration, incidentId)
          resolve(savedMetadata)
        } catch (err) {
          reject(err)
        }
      }

      this.mediaRecorder.stop()
    })
  }

  private static cleanupStream(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
  }

  static cancelRecording(): void {
    if (this.durationTimer !== null) {
      clearInterval(this.durationTimer)
      this.durationTimer = null
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = null
      this.mediaRecorder.stop()
    }
    this.cleanupStream()
    this.recordedChunks = []
    this.mediaRecorder = null
    if (this.onStateChangeCb) {
      this.onStateChangeCb('inactive', 0)
    }
  }
}
