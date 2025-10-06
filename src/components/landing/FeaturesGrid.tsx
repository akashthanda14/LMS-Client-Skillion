"use client";

import { motion } from "framer-motion";

const features = [
  { title: "Bite-sized Learning", desc: "Short, focused lessons you can finish in minutes." },
  { title: "AI-powered Paths", desc: "Personalized learning paths tailored by AI to your goals." },
  { title: "Verified Certificates", desc: "Earn certificates you can share with employers." },
  { title: "Mobile & Offline", desc: "Learn on the go with mobile-friendly lessons and downloads." },
];

export default function FeaturesGrid() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Why MicroCourses</h2>
        <p className="text-slate-600 mt-2">Designed for working professionals and lifelong learners.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.article key={f.title} whileHover={{ y: -6 }} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
