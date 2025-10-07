"use client"

import React, { useEffect, useState } from 'react'
import CertificateCard from '@/components/certificates/CertificateCard'

interface Certificate {
  id: string
  serialHash?: string
  title?: string
  issuedAt?: string
  course?: { id: string; title: string }
  enrollmentId?: string
}

export default function UserCertificatesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certs, setCerts] = useState<Certificate[]>([])
  const [page, setPage] = useState(1)
  const perPage = 12

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/certificates')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setCerts(data.certificates || data || [])
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  if (loading) return <div className="p-6">Loading certificates…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  if (!certs || certs.length === 0) {
    return <div className="p-6">No certificates earned yet.</div>
  }

  const start = (page - 1) * perPage
  const paged = certs.slice(start, start + perPage)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Certificates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map((c) => (
          <CertificateCard key={c.id} certificate={c} />
        ))}
      </div>

      {certs.length > perPage && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
          <div>Page {page}</div>
          <button disabled={start + perPage >= certs.length} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      )}
    </div>
  )
}
