import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PhoneCall,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Grid,
  Clock,
  ArrowLeft,
  User,
  Shield,
  Check,
} from 'lucide-react'
import { FakeCallService } from '../services/fakeCallService'
import { IncidentService } from '../services/incidentService'
import { useAppStore } from '../store/useAppStore'

type CallState = 'setup' | 'waiting' | 'ringing' | 'connected'

export const FakeCallPage: React.FC = () => {
  const navigate = useNavigate()
  const settings = useAppStore(state => state.settings)
  const refreshIncidents = useAppStore(state => state.refreshIncidents)

  const [callState, setCallState] = useState<CallState>('setup')
  const [callerName, setCallerName] = useState(settings.fakeCallDefaultCaller || 'Mom – Mobile')
  const [delaySeconds, setDelaySeconds] = useState(0)
  const [remainingDelay, setRemainingDelay] = useState(0)

  // Call in-progress state
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(true)

  const delayTimerRef = useRef<number | null>(null)
  const durationTimerRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      FakeCallService.cleanup()
      if (delayTimerRef.current) clearInterval(delayTimerRef.current)
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    }
  }, [])

  const startScheduledCall = (delay: number) => {
    setDelaySeconds(delay)
    if (delay === 0) {
      triggerRinging()
    } else {
      setRemainingDelay(delay)
      setCallState('waiting')

      delayTimerRef.current = window.setInterval(() => {
        setRemainingDelay((prev) => {
          if (prev <= 1) {
            clearInterval(delayTimerRef.current!)
            delayTimerRef.current = null
            triggerRinging()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const triggerRinging = () => {
    setCallState('ringing')
    FakeCallService.startRinging()
    IncidentService.logEvent('fake_call', 'completed', undefined, `Fake call triggered (${callerName})`)
    refreshIncidents()
  }

  const acceptCall = () => {
    FakeCallService.stopRinging()
    FakeCallService.playSimulatedVoice()
    setCallState('connected')
    setCallDuration(0)

    durationTimerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  const endCall = () => {
    FakeCallService.cleanup()
    if (delayTimerRef.current) clearInterval(delayTimerRef.current)
    if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    setCallState('setup')
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // --- 1. RINGING SCREEN (Full-screen realistic incoming call) ---
  if (callState === 'ringing') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col justify-between py-12 px-6 animate-fade-in select-none">
        {/* Top Info */}
        <div className="text-center pt-8 animate-call-vibrate">
          <div className="w-24 h-24 rounded-full bg-slate-700/80 mx-auto flex items-center justify-center border-4 border-slate-600 shadow-2xl mb-4">
            <User className="w-12 h-12 text-slate-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{callerName}</h1>
          <p className="text-sm text-slate-400 mt-1">Incoming Call...</p>
        </div>

        {/* Bottom Call Action Buttons */}
        <div className="flex items-center justify-around px-8 pb-8">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={endCall}
              className="w-18 h-18 rounded-full bg-[#E53945] hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-transform active:scale-95"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
            <span className="text-xs text-slate-400 font-medium">Decline</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={acceptCall}
              className="w-18 h-18 rounded-full bg-[#17865D] hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce transition-transform active:scale-95"
            >
              <Phone className="w-8 h-8" />
            </button>
            <span className="text-xs text-slate-400 font-medium">Accept</span>
          </div>
        </div>
      </div>
    )
  }

  // --- 2. CONNECTED CALL SCREEN (Full-screen active call) ---
  if (callState === 'connected') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F172A] text-white flex flex-col justify-between py-12 px-6 animate-fade-in select-none">
        {/* Top Info */}
        <div className="text-center pt-8">
          <div className="w-20 h-20 rounded-full bg-slate-700/80 mx-auto flex items-center justify-center border-2 border-slate-600 shadow-xl mb-3">
            <User className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">{callerName}</h1>
          <p className="text-sm font-mono text-emerald-400 mt-1 font-semibold">
            {formatTimer(callDuration)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Simulated Conversation Active</p>
        </div>

        {/* Mock In-Call Controls */}
        <div className="max-w-xs mx-auto w-full grid grid-cols-3 gap-6 my-auto text-center">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${
              isMuted ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-[10px] font-medium">Mute</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-800 text-slate-300"
          >
            <Grid className="w-6 h-6" />
            <span className="text-[10px] font-medium">Keypad</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl ${
              isSpeaker ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Volume2 className="w-6 h-6" />
            <span className="text-[10px] font-medium">Speaker</span>
          </button>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center pb-8">
          <button
            type="button"
            onClick={endCall}
            className="w-18 h-18 rounded-full bg-[#E53945] hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-transform active:scale-95"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>
      </div>
    )
  }

  // --- 3. WAITING COUNTDOWN SCREEN ---
  if (callState === 'waiting') {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4 space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#241B28] dark:text-[#F7F3F8]">
            Simulated Call Scheduled
          </h2>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mt-1">
            Keep this tab active. Your phone will ring automatically in:
          </p>
          <div className="text-4xl font-extrabold text-[#5B214C] dark:text-[#C773B1] my-4 font-mono">
            {remainingDelay}s
          </div>
          <p className="text-[11px] text-[#746B77] dark:text-[#AFA5B4]">
            Caller: <strong>{callerName}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={endCall}
          className="px-6 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] text-xs font-bold text-[#E53945] hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          Cancel Scheduled Call
        </button>
      </div>
    )
  }

  // --- 4. SETUP / CONFIGURATION SCREEN ---
  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/tools')}
          className="p-2 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-blue-500" />
            <span>Fake Incoming Call</span>
          </h1>
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            Escape uncomfortable or suspicious situations discreetly.
          </p>
        </div>
      </div>

      {/* Disguise Notice */}
      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Safe Simulation:</strong> This does not place or receive real cellular telecom calls. It synthesizes a realistic ringtone, vibration, and voice locally on this device.
        </div>
      </div>

      {/* Caller Configuration */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-3">
        <label className="block text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
          Caller Identity
        </label>
        <input
          type="text"
          value={callerName}
          onChange={(e) => setCallerName(e.target.value)}
          placeholder="e.g. Mom – Mobile, Boss, Police"
          className="w-full px-3 py-2 rounded-xl text-xs border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] focus:outline-none focus:ring-1 focus:ring-[#5B214C]"
        />

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['Mom – Mobile', 'Dad', 'Brother', 'Cab Driver', 'Manager'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCallerName(preset)}
              className="px-2.5 py-1 rounded-lg text-[11px] bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] hover:bg-[#F7DDE7]/50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Delay Timer Selectors */}
      <div className="bg-white dark:bg-[#1E1423] p-4 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm space-y-3">
        <label className="block text-xs font-bold text-[#241B28] dark:text-[#F7F3F8]">
          Schedule Trigger Delay
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => startScheduledCall(0)}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:opacity-95 flex items-center justify-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Immediately</span>
          </button>

          <button
            type="button"
            onClick={() => startScheduledCall(10)}
            className="p-3 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] font-semibold text-xs hover:bg-[#F7DDE7]/40 flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>In 10 Seconds</span>
          </button>

          <button
            type="button"
            onClick={() => startScheduledCall(30)}
            className="p-3 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] font-semibold text-xs hover:bg-[#F7DDE7]/40 flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>In 30 Seconds</span>
          </button>

          <button
            type="button"
            onClick={() => startScheduledCall(60)}
            className="p-3 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7] dark:border-[#3D2336] font-semibold text-xs hover:bg-[#F7DDE7]/40 flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>In 1 Minute</span>
          </button>
        </div>
      </div>
    </div>
  )
}
