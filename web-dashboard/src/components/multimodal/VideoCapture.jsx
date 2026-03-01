import React, { useRef, useState } from 'react'
import { Upload, X, Play } from 'lucide-react'
import { useI18n } from '../../context/I18nProvider'

export default function VideoCapture({ onCaptured, onError, maxDurationSeconds = 15, maxSizeMB = 50 }) {
  const { t } = useI18n()
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

  const validateFile = (file) => {
    const validTypes = ['video/mp4', 'video/webm']
    const maxBytes = maxSizeMB * 1024 * 1024

    if (!validTypes.includes(file.type)) {
      const errorMsg = t('multimodal.invalidVideoType')
      setError(errorMsg)
      onError(errorMsg)
      return false
    }

    if (file.size > maxBytes) {
      const errorMsg = t('multimodal.videoTooLarge', { size: maxSizeMB })
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
        const url = event.target.result
        setPreview(url)
        setVideoFile(file)
        setError(null)
        onCaptured(file)

        // Validate duration
        const video = document.createElement('video')
        video.onloadedmetadata = () => {
          if (video.duration > maxDurationSeconds) {
            const errorMsg = t('multimodal.videoTooLong', { duration: maxDurationSeconds })
            setError(errorMsg)
            onError(errorMsg)
            setPreview(null)
            setVideoFile(null)
          }
        }
        video.src = url
      }
      reader.readAsDataURL(file)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setVideoFile(null)
    setError(null)
  }

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
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
            <span>{t('multimodal.uploadVideo')}</span>
          </button>

          <p style={{ color: 'var(--text-secondary)' }} className="text-xs text-center">
            {t('multimodal.videoRequirements', { duration: maxDurationSeconds, size: maxSizeMB })}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <video
              ref={videoRef}
              src={preview}
              className="w-full"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
              controls
            />
          </div>

          <button
            onClick={playVideo}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-info)',
              color: 'white',
            }}
          >
            <Play size={18} />
            {t('multimodal.playVideo')}
          </button>

          <button
            onClick={clearPreview}
            className="w-full p-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <X size={18} />
            {t('multimodal.clear')}
          </button>

          <p style={{ color: 'var(--text-secondary)' }} className="text-xs text-center">
            ✓ {t('multimodal.videoReady')}
          </p>
        </div>
      )}
    </div>
  )
}
