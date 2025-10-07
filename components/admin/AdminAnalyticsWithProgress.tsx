'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Activity, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { GrowthMetrics } from '@/lib/api';

interface Props {
  growthMetrics: GrowthMetrics;
}

function numberOrZero(n?: number | null) {
  return typeof n === 'number' ? n : 0;
}

export function AdminAnalyticsWithProgress({ growthMetrics }: Props) {
  const items = [
    { key: 'Users', icon: Users, data: growthMetrics.users, color: { bg: 'bg-blue-100', text: 'text-blue-600' } },
    { key: 'Enrollments', icon: BookOpen, data: growthMetrics.enrollments, color: { bg: 'bg-green-100', text: 'text-green-600' } },
    { key: 'Courses', icon: Activity, data: growthMetrics.courses, color: { bg: 'bg-purple-100', text: 'text-purple-600' } },
    { key: 'Certificates', icon: Award, data: growthMetrics.certificates, color: { bg: 'bg-orange-100', text: 'text-orange-600' } },
  ];

  const cardMotion = (index: number) => ({
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: index * 0.1 },
  });

  const ProgressRow = ({ label, percent, barClass = 'bg-gradient-to-r from-blue-400 to-blue-600' }: { label: string; percent: number; barClass?: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm text-blue-600 font-semibold">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3">
        <motion.div
          className={`${barClass} h-3 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8 }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        />
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">30-Day Growth Trends</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((it, idx) => {
          const Icon = it.icon;
          const current = numberOrZero(it.data.current);
          const previous = numberOrZero(it.data.previous);
          const percent = current + previous > 0 ? Math.round((current / Math.max(1, current + previous)) * 100) : 0;
          return (
            <motion.div key={it.key} {...cardMotion(idx)}>
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`${it.color.bg} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <Icon className={`${it.color.text} w-6 h-6`} />
                    </div>
                    <h3 className="font-semibold text-gray-900">{it.key}</h3>
                  </div>
                  <div className={`flex items-center gap-1 ${parseFloat(it.data.growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(it.data.growthRate) >= 0 ? <svg className="w-4 h-4" /> : <svg className="w-4 h-4" />}
                    <span className="text-sm font-semibold">{it.data.growthRate}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">Current</p>
                    <p className="text-2xl font-bold text-gray-900">{current.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Previous</p>
                    <p className="text-xl font-semibold text-gray-600">{previous.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Growth</p>
                    <p className={`text-xl font-semibold ${parseFloat(it.data.growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {it.data.growth >= 0 ? '+' : ''}{it.data.growth}
                    </p>
                  </div>
                </div>

                <ProgressRow label="Current vs Total" percent={percent} />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
