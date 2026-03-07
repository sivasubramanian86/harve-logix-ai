/**
 * S3 Upload Service
 * Handles file uploads to AWS S3 with proper path structure
 */

import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const s3 = new AWS.S3({
  region: 'ap-south-2', // Hardcoded the correct bucket region to avoid constraint errors
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'harvelogix-multimodal'

/**
 * Upload file to S3 with local fallback
 * @param {Object} file - Multer file object
 * @param {string} scanType - Type of scan
 * @returns {Promise<string>} S3 URI or Local File Path
 */
async function uploadFile(file, scanType) {
  const fileId = uuidv4()
  const timestamp = new Date().toISOString().split('T')[0]
  const extension = getFileExtension(file.mimetype)
  const fileName = `${fileId}${extension}`
  const key = `multimodal/${scanType}/${timestamp}/${fileName}`

  try {
    console.log(`Attempting S3 upload to bucket: ${BUCKET_NAME}, key: ${key}`)
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
    console.log('S3 upload successful:', result.Location)
    return result.Location
  } catch (error) {
    console.warn('S3 upload failed, falling back to local storage:', error.message)
    
    // Local Fallback
    try {
      const uploadDir = path.join(__dirname, '../uploads', scanType, timestamp)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const localPath = path.join(uploadDir, fileName)
      fs.writeFileSync(localPath, file.buffer)
      
      console.log('Local fallback successful:', localPath)
      // Return a special prefix to indicate local path
      return `local://${localPath}`
    } catch (localError) {
      console.error('Local fallback also failed:', localError)
      throw new Error(`Failed to store file (Both S3 and Local failed): ${localError.message}`)
    }
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
