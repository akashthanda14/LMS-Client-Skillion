"use client";

import { motion } from "framer-motion";

const customers = [
  { name: "Sanjay R.", title: "Frontend Engineer", quote: "MicroCourses helped me pick up React patterns quickly.", stars: 5, badge: "React" },
  { name: "Priya K.", title: "Data Analyst", quote: "Short lessons made learning data visualization painless.", stars: 5, badge: "Data" },
  { name: "Carlos M.", title: "Product Manager", quote: "AI paths kept me focused and job-ready.", stars: 5, badge: "PM" },
];

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center text-yellow-500" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.285 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.44a1 1 0 00-.364 1.118l1.285 3.95c.3.921-.755 1.688-1.54 1.118L10 14.347l-3.37 2.44c-.784.57-1.838-.197-1.54-1.118l1.285-3.95a1 1 0 00-.364-1.118L2.64 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.95z" /></svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">What our learners say</h2>
        <p className="text-slate-600 mt-2">Real results from real students.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {customers.map((c) => (
          <motion.blockquote key={c.name} whileHover={{ y: -6 }} className="bg-white p-6 rounded-lg shadow-sm">
            <Stars count={c.stars} />
            <p className="mt-3 text-slate-700">“{c.quote}”</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-slate-500">{c.title}</div>
              </div>
              <div className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{c.badge}</div>
            </div>
          </motion.blockquote>
        ))}
      </div>
    </div>
  );
}
