'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Loader2, Award, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { progressAPI, CertificateVerification } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CertificateVerifyPageProps {
  params: {
    serialHash: string;
  };
}

export default function CertificateVerifyPage({ params }: CertificateVerifyPageProps) {
  const router = useRouter();
  const [verification, setVerification] = useState<CertificateVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [manualHash, setManualHash] = useState('');

  const verifyHash = async (hash: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await progressAPI.verifyCertificate(hash);
      setVerification(response.data);
    } catch (err: any) {
      console.error('Verification failed:', err);
      const errorMessage = err.response?.data?.message || 'Failed to verify certificate';
      setError(errorMessage);
      setVerification({ valid: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.serialHash) {
      verifyHash(params.serialHash);
    } else {
      setIsLoading(false);
    }
  }, [params.serialHash]);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualHash.trim()) {
      router.push(`/certificates/verify/${manualHash.trim()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 text-lg">Verifying certificate...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of MicroCourses certificates
          </p>
        </motion.div>

        {/* Manual Verification Form */}
        {!params.serialHash && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <form onSubmit={handleManualVerify} className="space-y-4">
                <div>
                  <Label htmlFor="serial-hash">Certificate Serial Number</Label>
                  <Input
                    id="serial-hash"
                    value={manualHash}
                    onChange={(e) => setManualHash(e.target.value)}
                    placeholder="Enter certificate serial number"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    The serial number can be found on the certificate PDF
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={!manualHash.trim()}>
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Certificate
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Verification Result */}
        {verification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: params.serialHash ? 0 : 0.3 }}
          >
            <Card
              className={`p-8 ${
                verification.valid
                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'border-red-300 bg-gradient-to-br from-red-50 to-orange-50'
              }`}
            >
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="inline-flex">
                  {verification.valid ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"
                    >
                      <XCircle className="w-12 h-12 text-red-600" />
                    </motion.div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <h2
                    className={`text-3xl font-bold mb-2 ${
                      verification.valid ? 'text-green-900' : 'text-red-900'
                    }`}
                  >
                    {verification.valid ? 'Certificate Valid ✓' : 'Certificate Invalid'}
                  </h2>
                  <p
                    className={`text-lg ${
                      verification.valid ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {verification.valid
                      ? 'This certificate has been verified and is authentic'
                      : 'This certificate could not be verified'}
                  </p>
                </div>

                {/* Details */}
                {verification.valid && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg p-6 space-y-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Course</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {verification.courseTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Recipient</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {verification.learnerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Issued On</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {verification.issuedAt &&
                            new Date(verification.issuedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-500 text-center">
                        Serial Number: {params.serialHash}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {!verification.valid && error && (
                  <p className="text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg p-3">
                    {error}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-600"
        >
          <p>
            All certificates issued by MicroCourses are digitally signed and can be
            verified using this tool.
          </p>
          <Button
            variant="link"
            onClick={() => router.push('/')}
            className="mt-2"
          >
            Return to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
