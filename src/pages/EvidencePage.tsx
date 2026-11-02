import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderLock,
  ArrowLeft,
  Play,
  Pause,
  Download,
  Trash2,
  Edit2,
  HardDrive,
  Clock,
  Mic,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { IndexedDBService } from '../services/indexedDBService'
import { AudioEvidenceMetadata } from '../types'

export const EvidencePage: React.FC = () => {
  const navigate = useNavigate()
  const [recordings, setRecordings] = useState<AudioEvidenceMetadata[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [storageEstimate, setStorageEstimate] = useState<string>('Calculating...')

  // Audio playback state
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null)
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Rename modal
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [newFilename, setNewFilename] = useState('')

  const loadRecordings = async () => {
    setIsLoading(true)
    try {
      const list = await IndexedDBService.getAllRecordings()
      setRecordings(list)
      const est = await IndexedDBService.getStorageEstimate()
      setStorageEstimate(est.usageFormatted)
    } catch (e) {
      console.error('Failed to load recordings from IndexedDB', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecordings()
    return () => {
      if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl)
      }
    }
  }, [])

  const handlePlay = async (id: string) => {
    if (activeAudioId === id && isPlaying) {
      setIsPlaying(false)
      return
    }

    if (activeAudioId === id && !isPlaying) {
      setIsPlaying(true)
      return
    }

    try {
      if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl)
      }
      const blob = await IndexedDBService.getRecordingBlob(id)
      if (!blob) return

      const url = URL.createObjectURL(blob)
      setActiveAudioId(id)
      setActiveAudioUrl(url)
      setIsPlaying(true)
    } catch (e) {
      console.error('Audio playback failed', e)
    }
  }

  const handleDownload = async (id: string, filename: string) => {
    try {
      const blob = await IndexedDBService.getRecordingBlob(id)
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch (e) {
      console.error('Download failed', e)
    }
  }

  const handleDelete = async (id: string, filename: string) => {
    if (window.confirm(`Permanently delete "${filename}" from this device?`)) {
      if (activeAudioId === id) {
        setActiveAudioId(null)
        if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl)
        setActiveAudioUrl(null)
        setIsPlaying(false)
      }
      await IndexedDBService.deleteRecording(id)
      await loadRecordings()
    }
  }

  const openRenameModal = (id: string, currentName: string) => {
    setRenamingId(id)
    setNewFilename(currentName)
  }

  const saveRename = async () => {
    if (!renamingId || !newFilename.trim()) return
    await IndexedDBService.renameRecording(renamingId, newFilename.trim())
    setRenamingId(null)
    await loadRecordings()
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-md mx-auto space-y-4 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tools')}
            className="p-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-purple-600" />
              <span>Evidence Vault</span>
            </h1>
            <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
              Stored securely in local device IndexedDB.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/recorder')}
          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 shadow"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Record</span>
        </button>
      </div>

      {/* Storage Quota Card */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#746B77] dark:text-[#AFA5B4]">
          <HardDrive className="w-4 h-4 text-purple-600" />
          <span>Local Storage Used:</span>
        </div>
        <span className="font-bold font-mono text-[#5B214C] dark:text-[#C773B1]">
          {storageEstimate}
        </span>
      </div>

      {/* Active Audio Player */}
      {activeAudioUrl && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg space-y-2">
          <div className="text-xs font-semibold flex items-center justify-between">
            <span>Now Playing</span>
            <button
              onClick={() => {
                setActiveAudioUrl(null)
                setActiveAudioId(null)
                setIsPlaying(false)
              }}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <audio
            src={activeAudioUrl}
            controls
            autoPlay
            className="w-full h-9 rounded-lg"
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* Recordings List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-[#746B77] dark:text-[#AFA5B4]">
          Loading stored evidence...
        </div>
      ) : recordings.length === 0 ? (
        <div className="bg-white dark:bg-[#1E1423] rounded-2xl p-8 border border-dashed border-[#F7DDE7] dark:border-[#3D2336] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center mx-auto text-purple-600">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#241B28] dark:text-[#F7F3F8]">
              No Audio Evidence Recorded
            </h3>
            <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mt-1">
              Microphone recordings will be cataloged and preserved here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/recorder')}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow"
          >
            Start Audio Recording
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              className={`p-3.5 rounded-2xl bg-white dark:bg-[#1E1423] border transition-all ${
                activeAudioId === rec.id
                  ? 'border-purple-600 shadow-md'
                  : 'border-[#F7DDE7] dark:border-[#3D2336]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] truncate">
                      {rec.filename}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-[#746B77] dark:text-[#AFA5B4]">
                      <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatDuration(rec.duration)}</span>
                      <span>•</span>
                      <span>{formatBytes(rec.size)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlay(rec.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    activeAudioId === rec.id && isPlaying
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {activeAudioId === rec.id && isPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#F7DDE7]/50 dark:border-[#3D2336]/60 text-[11px]">
                <button
                  type="button"
                  onClick={() => openRenameModal(rec.id, rec.filename)}
                  className="p-1 text-[#746B77] dark:text-[#AFA5B4] hover:text-[#5B214C] flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(rec.id, rec.filename)}
                  className="p-1 text-[#17865D] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(rec.id, rec.filename)}
                  className="p-1 text-[#E53945] hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      {renamingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1423] max-w-xs w-full rounded-2xl p-5 border border-[#F7DDE7] dark:border-[#3D2336] shadow-2xl">
            <h3 className="text-xs font-bold text-[#241B28] dark:text-[#F7F3F8] mb-2">
              Rename Audio Evidence File
            </h3>
            <input
              type="text"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] mb-3 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRenamingId(null)}
                className="flex-1 py-2 text-xs font-semibold text-[#746B77]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRename}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
