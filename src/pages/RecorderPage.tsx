import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic,
  Square,
  Pause,
  Play,
  ArrowLeft,
  FolderLock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { RecordingService, RecorderState } from '../services/recordingService'
import { IncidentService } from '../services/incidentService'
import { useAppStore } from '../store/useAppStore'

export const RecorderPage: React.FC = () => {
  const navigate = useNavigate()
  const refreshIncidents = useAppStore(state => state.refreshIncidents)

  const [recorderState, setRecorderState] = useState<RecorderState>('inactive')
  const [duration, setDuration] = useState(0)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [supportedMime, setSupportedMime] = useState('')

  useEffect(() => {
    setSupportedMime(RecordingService.getSupportedMimeType() || 'audio/webm')

    RecordingService.setListener((state, dur) => {
      setRecorderState(state)
      setDuration(dur)
    })

    return () => {
      if (RecordingService.getState() !== 'inactive') {
        RecordingService.cancelRecording()
      }
      RecordingService.setListener(() => {})
    }
  }, [])

  const startRecord = async () => {
    setSavedSuccess(false)
    setErrorMessage(null)
    try {
      await RecordingService.startRecording()
      setRecorderState('recording')
      IncidentService.logEvent('recording_created', 'completed')
      refreshIncidents()
    } catch (e: unknown) {
      setErrorMessage(
        e instanceof Error
          ? e.message
          : 'Microphone permission denied. Please grant microphone access in browser settings.'
      )
    }
  }

  const pauseRecord = () => {
    RecordingService.pauseRecording()
  }

  const resumeRecord = () => {
    RecordingService.resumeRecording()
  }

  const stopRecord = async () => {
    try {
      const metadata = await RecordingService.stopRecording()
      if (metadata) {
        setSavedSuccess(true)
        refreshIncidents()
      }
    } catch (e: unknown) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to save audio recording to IndexedDB.')
    }
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in pb-12">
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
              <Mic className="w-5 h-5 text-purple-600" />
              <span>Audio Evidence Recorder</span>
            </h1>
            <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
              Zero-server, local microphone evidence capture.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/evidence')}
          className="p-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#F7DDE7]/40"
        >
          <FolderLock className="w-4 h-4 text-purple-600" />
          <span>Library</span>
        </button>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-[#E53945] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success alert */}
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#17865D]/15 border border-[#17865D]/30 text-xs font-semibold text-[#17865D] dark:text-[#2CD69A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>Audio evidence successfully saved to IndexedDB!</span>
          </div>
          <button
            onClick={() => navigate('/evidence')}
            className="underline font-bold"
          >
            View Vault
          </button>
        </div>
      )}

      {/* Main Recording Surface Card */}
      <div className="bg-white dark:bg-[#1E1423] p-8 rounded-3xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm text-center flex flex-col items-center justify-center space-y-6">
        {/* Pulsing Mic Circle */}
        <div className="relative">
          {recorderState === 'recording' && (
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
          )}
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all ${
              recorderState === 'recording'
                ? 'bg-purple-600 text-white shadow-purple-500/40'
                : recorderState === 'paused'
                ? 'bg-amber-500 text-white shadow-amber-500/40'
                : 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
            }`}
          >
            <Mic className={`w-12 h-12 ${recorderState === 'recording' ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Live Timer Display */}
        <div>
          <div className="text-4xl font-extrabold font-mono tracking-wider text-[#241B28] dark:text-[#F7F3F8]">
            {formatTimer(duration)}
          </div>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mt-1 capitalize font-medium">
            {recorderState === 'recording'
              ? 'Recording live audio evidence...'
              : recorderState === 'paused'
              ? 'Recording paused'
              : 'Ready to capture audio'}
          </p>
        </div>

        {/* Live Soundwave Bar Visualization */}
        {recorderState === 'recording' && (
          <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs">
            {[30, 60, 45, 80, 100, 70, 90, 50, 85, 65, 40, 95].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-150 animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.07}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Dynamic Controls */}
        <div className="flex items-center gap-3 pt-2">
          {recorderState === 'inactive' ? (
            <button
              type="button"
              onClick={startRecord}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:opacity-95 transition-opacity"
            >
              Start Recording
            </button>
          ) : (
            <>
              {recorderState === 'recording' ? (
                <button
                  type="button"
                  onClick={pauseRecord}
                  className="px-5 py-3 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-xs font-bold flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRecord}
                  className="px-5 py-3 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume</span>
                </button>
              )}

              <button
                type="button"
                onClick={stopRecord}
                className="px-6 py-3 rounded-xl bg-[#E53945] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-500/30 hover:bg-red-700"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop & Save</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metadata & Technical Specs */}
      <div className="p-3.5 rounded-2xl bg-[#FFF9FB] dark:bg-[#1E1423] border border-[#F7DDE7] dark:border-[#3D2336] text-xs text-[#746B77] dark:text-[#AFA5B4] space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-[#241B28] dark:text-[#F7F3F8]">
          <ShieldCheck className="w-4 h-4 text-[#17865D]" />
          <span>Local Hardware Specs</span>
        </div>
        <p className="text-[11px]">
          Engine: <strong>MediaRecorder API</strong> • Format: <span className="font-mono">{supportedMime}</span>
        </p>
        <p className="text-[11px]">
          Files are stored as raw binary blobs in local <strong>IndexedDB</strong>. Zero bytes are uploaded to any server.
        </p>
      </div>
    </div>
  )
}
