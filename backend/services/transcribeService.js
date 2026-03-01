/**
 * Transcribe Service
 * Handles audio transcription using AWS Transcribe
 */

const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

const transcribe = new AWS.TranscribeService({
  region: process.env.AWS_REGION || 'us-east-1',
})

/**
 * Transcribe audio file
 * @param {string} s3Uri - S3 URI of audio file
 * @returns {Promise<Object>} Transcription result
 */
async function transcribeAudio(s3Uri) {
  try {
    const jobName = `transcribe-${uuidv4()}`

    const params = {
      TranscriptionJobName: jobName,
      Media: {
        MediaFileUri: s3Uri,
      },
      MediaFormat: getMediaFormat(s3Uri),
      LanguageCode: 'en-US', // Can be made dynamic based on language hint
      OutputBucketName: process.env.S3_BUCKET_NAME || 'harvelogix-multimodal',
    }

    // Start transcription job
    await transcribe.startTranscriptionJob(params).promise()

    // Poll for job completion
    const result = await pollTranscriptionJob(jobName)

    return result
  } catch (error) {
    console.error('Transcribe error:', error)
    throw new Error(`Failed to transcribe audio: ${error.message}`)
  }
}

/**
 * Poll for transcription job completion
 */
async function pollTranscriptionJob(jobName, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await transcribe.getTranscriptionJob({ TranscriptionJobName: jobName }).promise()

      const job = response.TranscriptionJob

      if (job.TranscriptionJobStatus === 'COMPLETED') {
        // Fetch transcript from output file
        const transcript = await fetchTranscriptFromS3(job.Transcript.TranscriptFileUri)
        return {
          transcript: transcript.text,
          language_detected: job.LanguageCode,
          confidence_score: transcript.confidence,
        }
      } else if (job.TranscriptionJobStatus === 'FAILED') {
        throw new Error(`Transcription job failed: ${job.FailureReason}`)
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Poll error:', error)
      throw error
    }
  }

  throw new Error('Transcription job timeout')
}

/**
 * Fetch transcript from S3
 */
async function fetchTranscriptFromS3(transcriptUri) {
  try {
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'us-east-1',
    })

    const key = transcriptUri.split('/').slice(-1)[0]
    const bucket = process.env.S3_BUCKET_NAME || 'harvelogix-multimodal'

    const response = await s3.getObject({ Bucket: bucket, Key: key }).promise()

    const data = JSON.parse(response.Body.toString())

    // Extract transcript and confidence
    const results = data.results.transcripts[0].transcript
    const confidence = data.results.items.reduce((sum, item) => sum + (item.confidence || 0), 0) / data.results.items.length

    return {
      text: results,
      confidence: confidence,
    }
  } catch (error) {
    console.error('Fetch transcript error:', error)
    throw error
  }
}

/**
 * Get media format from S3 URI
 */
function getMediaFormat(s3Uri) {
  if (s3Uri.includes('.wav')) return 'wav'
  if (s3Uri.includes('.mp3')) return 'mp3'
  if (s3Uri.includes('.ogg')) return 'ogg'
  return 'wav'
}

module.exports = {
  transcribeAudio,
}
