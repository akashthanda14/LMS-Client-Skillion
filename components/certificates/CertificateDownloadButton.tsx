import React, { useState } from 'react'

interface Props {
  enrollmentId: string
}

export default function CertificateDownloadButton({ enrollmentId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/enrollments/${encodeURIComponent(enrollmentId)}/certificate/download`)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Download failed: ${res.status}`)
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${enrollmentId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start space-y-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Downloading…' : 'Download'}
      </button>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
