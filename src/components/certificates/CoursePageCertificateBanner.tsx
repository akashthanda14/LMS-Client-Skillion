import React, { useEffect, useState } from 'react'
import CertificateDownloadButton from './CertificateDownloadButton'

interface Props {
  enrollmentId: string
  progressPercent: number
}

export default function CoursePageCertificateBanner({ enrollmentId, progressPercent }: Props) {
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      if (progressPercent < 100) return
      setLoading(true)
      try {
        const res = await fetch(`/api/enrollments/${encodeURIComponent(enrollmentId)}/certificate`)
        if (res.status === 404) {
          if (!mounted) return
          setAvailable(false)
          return
        }
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if (!mounted) return
        setAvailable(!!data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    check()
    return () => { mounted = false }
  }, [enrollmentId, progressPercent])

  if (progressPercent < 100) return null

  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Course completed</div>
          <div className="text-sm text-gray-700">You have completed the course. Claim your certificate below.</div>
        </div>
        <div>
          {loading && <div className="text-sm">Checking certificate…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {available === false && <div className="text-sm">Certificate pending — it may take a few minutes to generate.</div>}
          {available === true && <CertificateDownloadButton enrollmentId={enrollmentId} />}
        </div>
      </div>
    </div>
  )
}
