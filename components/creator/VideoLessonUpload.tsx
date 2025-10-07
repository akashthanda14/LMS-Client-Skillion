"use client"

import React, { useMemo, useState } from 'react'
import useVideoUpload from '@/hooks/useVideoUpload'

interface Props {
  courseId: string
  nextOrder?: number
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB
const ALLOWED_TYPES = [
  'video/mp4',
  'video/quicktime', // mov
  'video/x-msvideo', // avi
  'video/webm',
]

export default function VideoLessonUpload({ courseId, nextOrder }: Props) {
  const { state, startUpload, reset } = useVideoUpload(courseId)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState<number>(nextOrder ?? 1)
  const [duration, setDuration] = useState<number | undefined>(undefined)

  const fileName = useMemo(() => (file ? file.name : ''), [file])
  const fileSize = useMemo(() => (file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''), [file])

  const validate = (): string | null => {
    if (!file) return 'Please select a video file.'
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid file type. Allowed: mp4, mov, avi, webm.'
    if (file.size > MAX_FILE_SIZE) return 'File is too large. Max 500MB.'
    if (!title || title.trim().length < 3 || title.trim().length > 200) return 'Title must be 3-200 characters.'
    if (!Number.isInteger(order) || order < 1) return 'Order must be a positive integer.'
    return null
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    setFile(f)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      alert(v)
      return
    }

    try {
      await startUpload({ title: title.trim(), order, duration, file: file as File })
      alert('Upload complete')
      // reset
      setTitle('')
      setOrder(nextOrder ?? order + 1)
      setDuration(undefined)
      setFile(null)
      reset()
    } catch (err: any) {
      console.error('Upload error', err)
      // error state is set in hook
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-4 bg-white rounded-md shadow-sm max-w-xl">
      <h3 className="text-lg font-medium mb-3">Upload Video Lesson</h3>

      {state.error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 border border-red-100 rounded">{state.error}</div>
      )}
      {state.successMessage && (
        <div className="mb-3 p-2 bg-green-50 text-green-700 border border-green-100 rounded">{state.successMessage}</div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">File</label>
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          disabled={state.uploading}
          className="mt-1"
        />
        {file && (
          <div className="mt-2 text-sm text-gray-600">{fileName} • {fileSize}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={state.uploading}
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="Lesson title (3-200 chars)"
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Order</label>
          <input
            type="number"
            min={1}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            disabled={state.uploading}
            className="mt-1 w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (sec)</label>
          <input
            type="number"
            min={0}
            value={duration ?? ''}
            onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
            disabled={state.uploading}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="mb-3">
        <button
          type="submit"
          disabled={state.uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#d9673f] text-white rounded disabled:opacity-60"
        >
          {state.uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
              Uploading...
            </>
          ) : (
            'Upload Lesson'
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-4 bg-gray-100 rounded overflow-hidden">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${state.progress}%` }} />
      </div>

      <div className="mt-2 text-sm text-gray-600">{state.progress}%</div>
    </form>
  )
}
