import React from 'react';

export const dynamic = 'force-dynamic';

export default function CreatorAnalyticsPage() {
  return (
    <div className="relative px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Creator Analytics</h1>
      <p className="text-gray-600 text-sm max-w-prose">
        This page will display analytics for your courses (views, enrollments, completion rates, revenue trends).
        It is currently a placeholder. Replace this section with charts and metrics once the analytics API is ready.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Total Courses</h2>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Active Enrollments</h2>
          <div className="text-2xl font-bold">--</div>
        </div>
        <div className="p-4 rounded-lg border bg-white shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Avg Completion Rate</h2>
          <div className="text-2xl font-bold">--</div>
        </div>
      </div>
      <div className="p-6 rounded-lg border bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Enrollment growth line chart</li>
          <li>Revenue over time</li>
          <li>Lesson engagement heatmap</li>
          <li>Top performing courses</li>
        </ul>
      </div>
    </div>
  </div>
  );
}
