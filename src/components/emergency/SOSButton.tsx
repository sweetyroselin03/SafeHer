import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, AlertCircle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { SOSService } from '../../services/sosService'

interface SOSButtonProps {
  onTrigger?: () => void
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger }) => {
  const navigate = useNavigate()
  const settings = useAppStore(state => state.settings)
  const holdDuration = settings.sosHoldDuration || 1500

  const [isHolding, setIsHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const [useInstantTap, setUseInstantTap] = useState(false)

  const holdStartRef = useRef<number | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const handleTrigger = useCallback(() => {
    SOSService.triggerHaptic('emergency')
    setIsHolding(false)
    setProgress(100)
    if (onTrigger) {
      onTrigger()
    } else {
      navigate('/sos')
    }
  }, [navigate, onTrigger])

  const startHold = () => {
    if (useInstantTap) {
      handleTrigger()
      return
    }

    setIsHolding(true)
    holdStartRef.current = Date.now()
    SOSService.triggerHaptic('tap')

    const tick = () => {
      if (!holdStartRef.current) return
      const elapsed = Date.now() - holdStartRef.current
      const currentProgress = Math.min(100, (elapsed / holdDuration) * 100)
      setProgress(currentProgress)

      if (currentProgress >= 100) {
        handleTrigger()
      } else {
        animFrameRef.current = requestAnimationFrame(tick)
      }
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }

  const cancelHold = () => {
    setIsHolding(false)
    holdStartRef.current = null
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    setProgress(0)
  }

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [])

  // Calculate SVG circular stroke offset
  const radius = 95
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center my-6">
      {/* Outer Glow & Progress Ring */}
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple when not holding */}
        {!isHolding && !settings.reducedMotion && (
          <div className="absolute w-56 h-56 rounded-full bg-[#E53945]/15 animate-pulse-ring pointer-events-none" />
        )}

        {/* SVG Progress Circle */}
        <svg className="w-64 h-64 -rotate-90 transform pointer-events-none">
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-[#E53945]/15 dark:text-[#E53945]/25"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="#E53945"
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
            fill="transparent"
          />
        </svg>

        {/* Central SOS Button */}
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onTouchCancel={cancelHold}
          aria-label="Hold for SOS emergency activation"
          className={`absolute w-44 h-44 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all transform select-none ${
            isHolding
              ? 'scale-95 bg-gradient-to-br from-[#C9232F] to-[#A31621] shadow-[#E53945]/60'
              : 'hover:scale-102 bg-gradient-to-tr from-[#E53945] via-[#EB4B57] to-[#FF5E6C] shadow-[#E53945]/40'
          }`}
        >
          <ShieldAlert className={`w-14 h-14 mb-1 transition-transform ${isHolding ? 'scale-110 animate-bounce' : ''}`} />
          <span className="text-xl font-extrabold tracking-wider">
            {isHolding ? 'ACTIVATING...' : 'HOLD FOR SOS'}
          </span>
          <span className="text-[11px] font-medium opacity-90 mt-0.5">
            {useInstantTap ? 'Single tap mode' : `${(holdDuration / 1000).toFixed(1)}s hold`}
          </span>
        </button>
      </div>

      {/* Progress or instructions */}
      <div className="mt-4 text-center">
        {isHolding ? (
          <p className="text-sm font-semibold text-[#E53945] animate-pulse">
            Keep holding to confirm emergency ({Math.round(progress)}%)
          </p>
        ) : (
          <p className="text-xs text-[#746B77] dark:text-[#AFA5B4]">
            Press & hold the red button to launch immediate emergency assistance.
          </p>
        )}
      </div>

      {/* Accessibility Switch: One-tap fallback */}
      <button
        type="button"
        onClick={() => setUseInstantTap(!useInstantTap)}
        className="mt-3 text-xs text-[#5B214C] dark:text-[#C773B1] hover:underline flex items-center gap-1 focus:outline-none"
      >
        <AlertCircle className="w-3.5 h-3.5" />
        {useInstantTap ? 'Switch to safety hold' : 'Motor accessibility: enable 1-tap mode'}
      </button>
    </div>
  )
}
