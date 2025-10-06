"use client";

import { motion } from "framer-motion";

const steps = [
  { title: "Explore Courses", desc: "Find bite-sized modules across topics." },
  { title: "Follow AI Paths", desc: "Get a recommended learning path built for your goals." },
  { title: "Earn Credentials", desc: "Complete projects and earn certificates." },
];

export default function HowItWorks() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">How it works</h2>
        <p className="text-slate-600 mt-2">A simple 3-step process to go from learning to doing.</p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-lg font-semibold">{`Step ${i + 1}`}</div>
              <h3 className="mt-2 font-bold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <svg className="hidden sm:block absolute left-0 right-0 top-1/2 -z-10 mx-auto" width="800" height="120" viewBox="0 0 800 120" fill="none" aria-hidden>
          <path d="M40 60 C200 0 400 120 760 60" stroke="rgba(99,102,241,0.08)" strokeWidth="60" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
