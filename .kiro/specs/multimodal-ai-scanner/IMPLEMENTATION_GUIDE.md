# Implementation Guide: Multimodal AI Scanner

## Part 1: Frontend Components

### Directory Structure

```
web-dashboard/src/
├── components/
│   ├── multimodal/
│   │   ├── ImageCapture.jsx
│   │   ├── AudioCapture.jsx
│   │   ├── VideoCapture.jsx
│   │   ├── ScanResultsDisplay.jsx
│   │   └── ScanDetailDrawer.jsx
│   └── ...existing components...
├── pages/
│   ├── AiScannerUpgraded.jsx
│   └── ...existing pages...
├── services/
│   ├── multimodalService.ts
│   └── ...existing services...
└── i18n/
    └── locales/
        ├── en.json (add multimodal keys)
        └── ...other languages...
```

### ImageCapture Component

```jsx
// web-dashboard/src/components/multimodal/ImageCapture.jsx
import React, { useRef, useState } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { useI18n } from '../context/I18nProvider'

export default function ImageCapture({ onCaptured, onError, maxSizeMB = 10, instructions }) {
  const { t } = useI18n()
  const [preview, setPreview] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png']
    const maxBytes = maxSizeMB * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      onError(t('multimodal.invalidImageType'))
      return false
    }
    if (file.size > maxBytes) {
      onError(t('multimodal.imageTooLarge'))
      return false
    }
    return true
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target.result)
      }
      reader.readAsDataURL(file)
      onCaptured(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsRecording(true)
      }
    } catch (error) {
      onError(t('multimodal.cameraAccessDenied'))
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      context.drawImage(videoRef.current, 0, 0)
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        if (validateFile(file)) {
          setPreview(canvasRef.current.toDataURL())
          onCaptured(file)
          stopCamera()
        }
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {instructions && (
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
          {instructions}
        </p>
      )}

      {!preview ? (
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <Upload size={20} />
            {t('multimodal.uploadImage')}
          </button>

          <button
            onClick={isRecording ? stopCamera : startCamera}
            className="w-full p-4 border-2 rounded-lg flex items-center justify-center gap-2"
            style={{
              borderColor: 'var(--color-info)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <Camera size={20} />
            {isRecording ? t('multimodal.stopCamera') : t('multimodal.startCamera')}
          </button>

          {isRecording && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              />
              <button
                onClick={capturePhoto}
                className="w-full p-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: 'var(--color-success)',
                  color: 'white',
                }}
              >
                {t('multimodal.capturePhoto')}
              </button>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <img
            src={preview}
            alt="Preview"
            className="w-full rounded-lg"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
          <button
            onClick={clearPreview}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-primary)',
              border: '1px solid',
            }}
          >
            <X size={20} />
            {t('multimodal.retake')}
          </button>
        </div>
      )}
    </div>
  )
}
```

### AudioCapture Component

```jsx
// web-dashboard/src/components/multimodal/AudioCapture.jsx
import React, { useRef, useState, useEffect } from 'react'
import { Mic, Square, Play, RotateCcw } from 'lucide-react'
import { useI18n } from '../context/I18nProvider'

export default function AudioCapture({ onCaptured, onError, maxDurationSeconds = 60 }) {
  const { t } = useI18n()
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const durationIntervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        const file = new File([blob], 'audio.wav', { type: 'audio/wav' })
        onCaptured(file)
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
      onError(t('multimodal.micAccessDenied'))
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
      const audio = new Audio(url)
      audio.play()
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setDuration(0)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {!audioBlob ? (
        <div className="space-y-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="w-full p-6 rounded-lg flex items-center justify-center gap-3 font-semibold"
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
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>
                {formatTime(duration)}
              </p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {t('multimodal.recordingInProgress')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-sm font-semibold mb-2">{t('multimodal.recordingDuration')}</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
              {formatTime(duration)}
            </p>
          </div>

          <button
            onClick={playAudio}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--color-info)',
              color: 'white',
            }}
          >
            <Play size={20} />
            {t('multimodal.playback')}
          </button>

          <button
            onClick={resetRecording}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <RotateCcw size={20} />
            {t('multimodal.rerecord')}
          </button>
        </div>
      )}
    </div>
  )
}
```

