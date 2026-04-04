import React, { useRef, useState, useEffect } from 'react'
import { Mic, Square, Play, RotateCcw, Trash2 } from 'lucide-react'
import { useI18n } from '../../context/I18nProvider'

export default function AudioCapture({ onCaptured, onError, maxDurationSeconds = 60 }) {
  const { t } = useI18n()
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const durationIntervalRef = useRef(null)
  const audioElementRef = useRef(null)

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ''
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        const file = new File([blob], 'audio.wav', { type: 'audio/wav' })
        onCaptured?.(file)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDurationSeconds) {
            mediaRecorder.stop()
            setIsRecording(false)
            clearInterval(durationIntervalRef.current)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      const errorMsg = t('multimodal.micAccessDenied')
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio()
      }
      audioElementRef.current.src = url
      audioElementRef.current.onplay = () => setIsPlaying(true)
      audioElementRef.current.onended = () => setIsPlaying(false)
      audioElementRef.current.play()
    }
  }

  const pauseAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setDuration(0)
    setError(null)
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.src = ''
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="p-3 rounded-lg border-l-4"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--color-error)',
            color: 'var(--color-error)',
          }}
        >
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {!audioBlob ? (
        <div className="space-y-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="w-full p-6 rounded-lg flex items-center justify-center gap-3 font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: isRecording ? 'var(--color-error)' : 'var(--color-info)',
              color: 'white',
            }}
          >
            {isRecording ? (
              <>
                <Square size={24} />
                {t('multimodal.stopRecording')}
              </>
            ) : (
              <>
                <Mic size={24} />
                {t('multimodal.startRecording')}
              </>
            )}
          </button>

          {isRecording && (
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-info)' }}>
                {formatTime(duration)}
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">
                🔴 {t('multimodal.recordingInProgress')}
              </p>
              {duration > maxDurationSeconds * 0.8 && (
                <p style={{ color: 'var(--color-warning)' }} className="text-xs mt-2">
                  ⚠️ {t('multimodal.recordingLimitWarning')}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('multimodal.recordingDuration')}
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>
              {formatTime(duration)}
            </p>
          </div>

          <button
            onClick={isPlaying ? pauseAudio : playAudio}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-info)',
              color: 'white',
            }}
          >
            <Play size={20} />
            {isPlaying ? t('multimodal.pausePlayback') : t('multimodal.playback')}
          </button>

          <div className="flex gap-2">
            <button
              onClick={resetRecording}
              className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <RotateCcw size={18} />
              {t('multimodal.rerecord')}
            </button>

            <button
              onClick={resetRecording}
              className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <Trash2 size={18} />
              {t('multimodal.delete')}
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)' }} className="text-xs text-center">
            ✓ {t('multimodal.audioReady')}
          </p>
        </div>
      )}
    </div>
  )
}
