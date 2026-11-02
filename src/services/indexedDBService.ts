import { AudioEvidenceMetadata } from '../types'

const DB_NAME = 'SafeHerEvidenceDB'
const DB_VERSION = 1
const STORE_NAME = 'audio_evidence'

export interface StoredAudioRecord extends AudioEvidenceMetadata {
  blob: Blob
}

export class IndexedDBService {
  private static dbPromise: Promise<IDBDatabase> | null = null

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this device/browser.'))
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('incidentId', 'incidentId', { unique: false })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'))
      }
    })

    return this.dbPromise
  }

  static async saveRecording(
    blob: Blob,
    duration: number,
    incidentId?: string,
    customFilename?: string
  ): Promise<AudioEvidenceMetadata> {
    const db = await this.getDB()
    const id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    const timestamp = Date.now()
    const dateStr = new Date(timestamp).toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm'
    const filename = customFilename || `SafeHer_Evidence_${dateStr}.${ext}`

    const metadata: AudioEvidenceMetadata = {
      id,
      filename,
      mimeType: blob.type || 'audio/webm',
      duration: Math.round(duration),
      size: blob.size,
      createdAt: timestamp,
      incidentId,
    }

    const record: StoredAudioRecord = {
      ...metadata,
      blob,
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(record)

      request.onsuccess = () => resolve(metadata)
      request.onerror = () => reject(request.error)
    })
  }

  static async getAllRecordings(): Promise<AudioEvidenceMetadata[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const results = (request.result as StoredAudioRecord[]) || []
        // Return without raw blob in the list for speed & memory, sorted newest first
        const metadataList: AudioEvidenceMetadata[] = results
          .map(({ id, filename, mimeType, duration, size, createdAt, incidentId }) => ({
            id,
            filename,
            mimeType,
            duration,
            size,
            createdAt,
            incidentId,
          }))
          .sort((a, b) => b.createdAt - a.createdAt)
        resolve(metadataList)
      }
      request.onerror = () => reject(request.error)
    })
  }

  static async getRecordingBlob(id: string): Promise<Blob | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => {
        const record = request.result as StoredAudioRecord | undefined
        resolve(record ? record.blob : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  static async renameRecording(id: string, newFilename: string): Promise<boolean> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const getReq = store.get(id)

      getReq.onsuccess = () => {
        const record = getReq.result as StoredAudioRecord | undefined
        if (!record) {
          resolve(false)
          return
        }
        record.filename = newFilename
        const putReq = store.put(record)
        putReq.onsuccess = () => resolve(true)
        putReq.onerror = () => reject(putReq.error)
      }
      getReq.onerror = () => reject(getReq.error)
    })
  }

  static async deleteRecording(id: string): Promise<boolean> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  static async clearAllRecordings(): Promise<boolean> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  }

  static async getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; usageFormatted: string }> {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate()
        const used = estimate.usage || 0
        const quota = estimate.quota || 0
        const mb = (used / (1024 * 1024)).toFixed(2)
        return { usedBytes: used, quotaBytes: quota, usageFormatted: `${mb} MB` }
      } catch (e) {
        // Fallback
      }
    }
    return { usedBytes: 0, quotaBytes: 0, usageFormatted: 'Not supported' }
  }
}
