import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ShieldAlert, Lock, Zap, ArrowRight, Check, MapPin, Mic, Activity } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { MotionService } from '../services/motionService'

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const profile = useAppStore(state => state.profile)
  const setProfile = useAppStore(state => state.setProfile)
  const [step, setStep] = useState(0)

  // Form state
  const [name, setName] = useState(profile.displayName || '')
  const [permGeoStatus, setPermGeoStatus] = useState<string>('pending')
  const [permMicStatus, setPermMicStatus] = useState<string>('pending')
  const [permMotionStatus, setPermMotionStatus] = useState<string>('pending')

  const requestGeo = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setPermGeoStatus('granted'),
        () => setPermGeoStatus('denied')
      )
    }
  }

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setPermMicStatus('granted')
    } catch (e) {
      setPermMicStatus('denied')
    }
  }

  const requestMotion = async () => {
    const res = await MotionService.requestPermission()
    setPermMotionStatus(res === 'granted' ? 'granted' : 'denied')
  }

  const finishOnboarding = () => {
    setProfile({
      displayName: name.trim(),
      onboardingCompleted: true,
    })
    navigate('/')
  }

  const slides = [
    {
      title: 'Instant One-Tap SOS',
      desc: 'Hold the emergency button to immediately capture your GPS coordinates and generate a ready-to-send WhatsApp SOS alert to your trusted contacts.',
      icon: ShieldAlert,
      color: 'from-[#E53945] to-[#FF5E6C]',
    },
    {
      title: '100% Zero-Server Privacy',
      desc: 'SafeHer has no accounts, no cloud database, and no server tracking. Your GPS coordinates, contacts, and audio evidence stay strictly on your device.',
      icon: Lock,
      color: 'from-[#5B214C] to-[#7A2D66]',
    },
    {
      title: 'Deterrence & Evidence',
      desc: 'Deter threats with a piercing emergency siren or realistic fake incoming call. Capture and save encrypted-like local audio evidence in an instant.',
      icon: Zap,
      color: 'from-[#17865D] to-[#2CD69A]',
    },
  ]

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-md mx-auto py-6">
      {/* Top Header */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5B214C] to-[#3D1232] text-white shadow-xl shadow-[#5B214C]/25 mb-3">
          <Shield className="w-8 h-8 text-[#FF5E6C]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#5B214C] dark:text-[#C773B1]">SafeHer</h1>
        <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">Women's Safety & Emergency Response</p>
      </div>

      {/* Slide / Setup Content */}
      <div className="my-6">
        {step < 3 ? (
          <div className="text-center px-4 animate-fade-in">
            <div
              className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr ${slides[step].color} text-white flex items-center justify-center shadow-lg mb-6`}
            >
              {React.createElement(slides[step].icon, { className: 'w-10 h-10' })}
            </div>
            <h2 className="text-xl font-bold text-[#241B28] dark:text-[#F7F3F8] mb-3">
              {slides[step].title}
            </h2>
            <p className="text-sm text-[#746B77] dark:text-[#AFA5B4] leading-relaxed">
              {slides[step].desc}
            </p>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === idx
                      ? 'w-6 bg-[#5B214C] dark:bg-[#C773B1]'
                      : 'w-2 bg-[#F7DDE7] dark:bg-[#3D2336]'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1E1423] p-5 rounded-2xl border border-[#F7DDE7] dark:border-[#3D2336] shadow-sm animate-fade-in">
            <h2 className="text-lg font-bold text-[#241B28] dark:text-[#F7F3F8] mb-1">
              Personalize & Setup
            </h2>
            <p className="text-xs text-[#746B77] dark:text-[#AFA5B4] mb-4">
              Enter your name and grant safety permissions. All data stays offline on your phone.
            </p>

            {/* Display Name Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#5B214C] dark:text-[#C773B1] mb-1">
                Your Preferred Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2.5 rounded-xl border border-[#F7DDE7] dark:border-[#3D2336] bg-[#FFF9FB] dark:bg-[#140D17] text-sm focus:outline-none focus:ring-2 focus:ring-[#5B214C]"
              />
            </div>

            {/* Permissions Explanation & Requests */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#746B77] dark:text-[#AFA5B4]">
                Recommended Permissions
              </span>

              {/* Location */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#E53945]" />
                  <div>
                    <div className="text-xs font-semibold">Live GPS Location</div>
                    <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Attaches coordinates to WhatsApp SOS</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestGeo}
                  disabled={permGeoStatus === 'granted'}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    permGeoStatus === 'granted'
                      ? 'bg-[#17865D]/20 text-[#17865D]'
                      : 'bg-[#5B214C] text-white hover:bg-[#3D1232]'
                  }`}
                >
                  {permGeoStatus === 'granted' ? 'Allowed' : 'Enable'}
                </button>
              </div>

              {/* Microphone */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-[#7C3AED]" />
                  <div>
                    <div className="text-xs font-semibold">Microphone Access</div>
                    <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Allows saving local audio evidence</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestMic}
                  disabled={permMicStatus === 'granted'}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    permMicStatus === 'granted'
                      ? 'bg-[#17865D]/20 text-[#17865D]'
                      : 'bg-[#5B214C] text-white hover:bg-[#3D1232]'
                  }`}
                >
                  {permMicStatus === 'granted' ? 'Allowed' : 'Enable'}
                </button>
              </div>

              {/* Motion Sensor */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9FB] dark:bg-[#140D17] border border-[#F7DDE7]/50 dark:border-[#3D2336]">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-[#E9A23B]" />
                  <div>
                    <div className="text-xs font-semibold">Motion Sensor (Shake SOS)</div>
                    <div className="text-[10px] text-[#746B77] dark:text-[#AFA5B4]">Triggers SOS when phone is vigorously shaken</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={requestMotion}
                  disabled={permMotionStatus === 'granted'}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    permMotionStatus === 'granted'
                      ? 'bg-[#17865D]/20 text-[#17865D]'
                      : 'bg-[#5B214C] text-white hover:bg-[#3D1232]'
                  }`}
                >
                  {permMotionStatus === 'granted' ? 'Allowed' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 px-4">
        {step < 3 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={finishOnboarding}
              className="flex-1 py-3 text-xs font-semibold text-[#746B77] dark:text-[#AFA5B4] hover:text-[#5B214C] focus:outline-none"
            >
              Skip Introduction
            </button>
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 px-5 rounded-xl bg-[#5B214C] dark:bg-[#C773B1] text-white dark:text-[#140D17] text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={finishOnboarding}
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#5B214C] to-[#7A2D66] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#5B214C]/30 hover:opacity-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Complete Setup & Enter SafeHer</span>
          </button>
        )}
      </div>
    </div>
  )
}
