"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EmailCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="text-center max-w-2xl mx-auto">
        <h3 className="text-xl font-bold">Stay updated</h3>
        <p className="text-slate-600 mt-2">Get product updates, new courses, and learning tips.</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="px-4 py-3 rounded-md border w-full sm:w-auto" />
          <Button onClick={() => { setSubmitted(true); }} disabled={!email} className="px-6 py-3">{submitted ? 'Subscribed' : 'Subscribe'}</Button>
        </div>

        <div className="mt-4 text-xs text-slate-500">Trusted by teams at <strong>Acme</strong>, <strong>Globex</strong>, and <strong>Umbrella</strong>.</div>
      </div>
    </div>
  );
}
