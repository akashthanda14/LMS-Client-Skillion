import React from 'react'
import CertificateDownloadButton from './CertificateDownloadButton'

interface Certificate {
  id: string
  serialHash?: string
  title?: string
  issuedAt?: string
  course?: {
    id: string
    title: string
  }
  enrollmentId?: string
}

interface Props {
  certificate: Certificate
}

export default function CertificateCard({ certificate }: Props) {
  if (!certificate) return null

  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{certificate.title || 'Certificate'}</h3>
          <div className="text-sm text-gray-500">Issued: {certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString() : '—'}</div>
          {certificate.course && (
            <div className="text-sm text-gray-700 mt-2">Course: {certificate.course.title}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {certificate.enrollmentId && (
            <CertificateDownloadButton enrollmentId={certificate.enrollmentId} />
          )}
          {certificate.serialHash ? (
            <a
              href={`/certificates/verify/${encodeURIComponent(certificate.serialHash)}`}
              className="text-sm text-indigo-600 hover:underline"
            >
              Verify
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}
