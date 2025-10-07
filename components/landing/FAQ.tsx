"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const faqs = [
  { q: "How long are the courses?", a: "Most lessons are 5-15 minutes to fit busy schedules." },
  { q: "Do I get a certificate?", a: "Yes — earn verified certificates for completed paths." },
  { q: "Can I learn offline?", a: "Download lessons on mobile for offline study." },
  { q: "Is there a free tier?", a: "Yes, the Free plan includes selected courses." },
  { q: "Do you support teams?", a: "Enterprise plans include team seats and SSO." },
  { q: "How does AI personalize paths?", a: "AI recommends courses based on your goals and progress." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <p className="text-slate-600 mt-2">Answers to common questions about MicroCourses.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {faqs.map((f, i) => (
          <motion.div key={f.q} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} className="border rounded-lg">
            <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="w-full text-left p-4 flex justify-between items-center">
              <span className="font-medium">{f.q}</span>
              <span className="text-slate-500">{open === i ? '−' : '+'}</span>
            </button>

            {open === i && (
              <div className="p-4 pt-0 text-sm text-slate-700">{f.a}</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
