import React, { useRef, useState } from 'react'
import { Camera, Upload, X, RotateCcw } from 'lucide-react'
import { useI18n } from '../../context/I18nProvider'

export default function ImageCapture({ onCaptured, onError, maxSizeMB = 10, instructions }) {
  const { t } = useI18n()
  const [preview, setPreview] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png']
    const maxBytes = maxSizeMB * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      const errorMsg = t('multimodal.invalidImageType')
      setError(errorMsg)
      onError(errorMsg)
      return false
    }
    if (file.size > maxBytes) {
      const errorMsg = t('multimodal.imageTooLarge', { size: maxSizeMB })
      setError(errorMsg)
      onError(errorMsg)
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
        setError(null)
        onCaptured(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsRecording(true)
      }
    } catch (error) {
      const errorMsg = t('multimodal.cameraAccessDenied')
      setError(errorMsg)
      onError(errorMsg)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)
      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
        if (validateFile(file)) {
          setPreview(canvasRef.current.toDataURL())
          setError(null)
          onCaptured(file)
          stopCamera()
        }
      }, 'image/jpeg', 0.95)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
  }

  const retake = () => {
    clearPreview()
    startCamera()
  }

  return (
    <div className="space-y-4">
      {instructions && (
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm italic">
          💡 {instructions}
        </p>
      )}

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

      {!preview ? (
        <div className="space-y-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <Upload size={20} />
            <span>{t('multimodal.uploadImage')}</span>
          </button>

          <button
            onClick={isRecording ? stopCamera : startCamera}
            className="w-full p-4 border-2 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80 font-medium"
            style={{
              borderColor: 'var(--color-info)',
              backgroundColor: isRecording ? 'var(--color-error)' : 'var(--bg-secondary)',
              color: isRecording ? 'white' : 'var(--text-primary)',
            }}
          >
            <Camera size={20} />
            <span>{isRecording ? t('multimodal.stopCamera') : t('multimodal.startCamera')}</span>
          </button>

          {isRecording && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  maxHeight: '400px',
                  objectFit: 'cover',
                }}
              />
              <button
                onClick={capturePhoto}
                className="w-full p-3 rounded-lg font-semibold transition-all hover:opacity-90"
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
          <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <img
              src={preview}
              alt="Preview"
              className="w-full"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={retake}
              className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <RotateCcw size={18} />
              {t('multimodal.retake')}
            </button>

            <button
              onClick={clearPreview}
              className="flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <X size={18} />
              {t('multimodal.clear')}
            </button>
          </div>

          <p style={{ color: 'var(--text-secondary)' }} className="text-xs text-center">
            ✓ {t('multimodal.imageReady')}
          </p>
        </div>
      )}
    </div>
  )
}
