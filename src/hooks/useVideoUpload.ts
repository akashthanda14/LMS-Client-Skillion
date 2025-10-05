import { useCallback, useState } from 'react'
import { courseAPI } from '@/lib/api'
import type { CloudinaryUploadCredentials } from '@/lib/api'

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
  successMessage: string | null
}

interface CreateLessonPayload {
  title: string
  order: number
  duration?: number
  file: File
}

export const useVideoUpload = (courseId: string) => {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    successMessage: null,
  })

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null, successMessage: null })
  }, [])

  const startUpload = useCallback(async (payload: CreateLessonPayload) => {
    setState({ uploading: true, progress: 0, error: null, successMessage: null })

    try {
      // 1. Fetch signed credentials from backend
      const credsRes = await courseAPI.getUploadCredentials(courseId)
      if (!credsRes || !credsRes.success) throw new Error('Failed to get upload credentials')
      const creds: CloudinaryUploadCredentials = credsRes.data

      // 2. Build FormData with ONLY parameters that backend signed
      // Backend signs: folder, public_id, timestamp (in alphabetical order)
      // Other params (file, api_key, signature) are sent but not signed
      const form = new FormData()
      form.append('file', payload.file)
      
      // Add signed parameters in alphabetical order
      if (creds.folder) form.append('folder', creds.folder)
      if (creds.publicId) form.append('public_id', creds.publicId)
      form.append('timestamp', String(creds.timestamp))
      
      // Add signature and api_key (not signed but required)
      form.append('signature', creds.signature)
      form.append('api_key', creds.apiKey)

      // 3. Upload to Cloudinary using XHR
      const uploadUrl = creds.uploadUrl

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', uploadUrl)

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setState((s) => ({ ...s, progress: percent }))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resp = JSON.parse(xhr.responseText)
              // Cloudinary returns secure_url for uploaded resource
              const url = resp.secure_url || resp.secureUrl || resp.url || resp.secure_url_https
              if (!url) return reject(new Error('Upload succeeded but Cloudinary response missing secure_url'))
              // Sometimes Cloudinary returns duration for video
              resolve(url)
            } catch (err) {
              reject(new Error('Failed to parse Cloudinary response'))
            }
          } else {
            let msg = `Cloudinary upload failed with status ${xhr.status}`
            try { msg += `: ${xhr.responseText}` } catch {};
            reject(new Error(msg))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))

        // send headers if needed (Cloudinary usually doesn't require Authorization for direct uploads)
        xhr.send(form)
      })

      setState((s) => ({ ...s, progress: 100 }))

      // 4. POST lesson metadata to backend
      const lessonPayload = {
        title: payload.title,
        videoUrl: secureUrl,
        order: payload.order,
        duration: payload.duration,
      }

      const created = await courseAPI.createLesson(courseId, lessonPayload as any)
      if (!created || !created.success) throw new Error('Failed to create lesson')

      setState({ uploading: false, progress: 100, error: null, successMessage: 'Lesson uploaded successfully' })
      return created
    } catch (err: any) {
      const msg = err?.message || String(err)
      setState({ uploading: false, progress: 0, error: msg, successMessage: null })
      throw err
    }
  }, [courseId])

  return { state, startUpload, reset }
}

export default useVideoUpload
