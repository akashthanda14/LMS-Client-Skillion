"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.round((target / (duration / 16))));
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(id);
  }, [target, duration]);

  return count;
}

export default function Stats() {
  const students = useCounter(10000);
  const courses = useCounter(500);
  const completion = useCounter(95);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 12, opacity: 0 }} className="bg-white/10 p-6 rounded-lg text-center">
        <div className="text-3xl font-extrabold">{students.toLocaleString()}+</div>
        <div className="mt-2 text-sm">Students</div>
      </motion.div>

      <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 12, opacity: 0 }} transition={{ delay: 0.08 }} className="bg-white/10 p-6 rounded-lg text-center">
        <div className="text-3xl font-extrabold">{courses}+</div>
        <div className="mt-2 text-sm">Courses</div>
      </motion.div>

      <motion.div whileInView={{ y: 0, opacity: 1 }} initial={{ y: 12, opacity: 0 }} transition={{ delay: 0.16 }} className="bg-white/10 p-6 rounded-lg text-center">
        <div className="text-3xl font-extrabold">{completion}%</div>
        <div className="mt-2 text-sm">Completion Rate</div>
      </motion.div>
    </div>
  );
}
