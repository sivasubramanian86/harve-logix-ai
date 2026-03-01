/**
 * S3 Upload Service
 * Handles file uploads to AWS S3 with proper path structure
 */

import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'harvelogix-multimodal'

/**
 * Upload file to S3
 * @param {Object} file - Multer file object
 * @param {string} scanType - Type of scan (crop-health, field-irrigation, etc.)
 * @returns {Promise<string>} S3 URI
 */
async function uploadFile(file, scanType) {
  try {
    const fileId = uuidv4()
    const timestamp = new Date().toISOString().split('T')[0]
    const key = `multimodal/${scanType}/${timestamp}/${fileId}${getFileExtension(file.mimetype)}`

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'scan-type': scanType,
        'upload-timestamp': new Date().toISOString(),
      },
    }

    const result = await s3.upload(params).promise()

    return result.Location
  } catch (error) {
    console.error('S3 upload error:', error)
    throw new Error(`Failed to upload file to S3: ${error.message}`)
  }
}

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimeType) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/mpeg': '.mp3',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
  }

  return extensions[mimeType] || ''
}

/**
 * Delete file from S3
 */
async function deleteFile(s3Uri) {
  try {
    const key = s3Uri.split(`${BUCKET_NAME}/`)[1]

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    }

    await s3.deleteObject(params).promise()
  } catch (error) {
    console.error('S3 delete error:', error)
    throw new Error(`Failed to delete file from S3: ${error.message}`)
  }
}

export default {
  uploadFile,
  deleteFile,
}
