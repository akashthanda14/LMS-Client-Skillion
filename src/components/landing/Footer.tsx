"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const platformLinks = ["Browse Courses", "How it Works", "Success Stories", "Instructors", "Mobile App"];
const resourceLinks = ["Blog", "Help Center", "Community", "Webinars", "Case Studies", "Templates"];
const companyLinks = ["About Us", "Careers", "Press Kit", "Partners", "Affiliates", "Contact"];

function SocialIcon({ name }: { name: string }) {
  return (
    <button aria-label={name} className="w-10 h-10 rounded-full bg-white border border-[var(--primary)] flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition">
      {name[0]}
    </button>
  );
}

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <footer className="bg-[var(--primary)] text-white">
  <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand (col 1-2) */}
    <div className="md:col-span-3">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--primary)] text-white">LM</span>
            <div>
              <div className="text-lg font-bold text-white">LearnMicro</div>
        <div className="text-sm text-white/90">Short, focused courses that move careers forward.</div>
            </div>
          </div>

      <p className="mt-4 text-sm text-white/90">Micro-credentials and practical projects designed for professionals. Trusted by teams worldwide.</p>

          <div className="mt-6 flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19 7.5c.013.176.013.352.013.528 0 5.377-4.093 11.575-11.575 11.575A11.51 11.51 0 014 18.9c.34.04.69.058 1.041.058 2.027 0 3.89-.69 5.373-1.849a4.094 4.094 0 01-3.824-2.842c.252.038.505.064.774.064.373 0 .747-.05 1.093-.146a4.09 4.09 0 01-3.277-4.01v-.05c.548.305 1.18.49 1.852.51a4.087 4.087 0 01-1.804-3.403c0-.755.203-1.46.557-2.07a11.6 11.6 0 008.427 4.27c-.064-.305-.096-.62-.096-.946 0-2.281 1.847-4.128 4.128-4.128 1.186 0 2.26.498 3.015 1.297a8.236 8.236 0 002.627-1.01 4.12 4.12 0 01-1.813 2.273 8.227 8.227 0 002.364-.647 8.86 8.86 0 01-2.048 2.117z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.1c.5-.9 1.7-1.8 3.5-1.8 3.7 0 4.4 2.4 4.4 5.6V24h-4v-7.4c0-1.8 0-4.2-2.6-4.2-2.6 0-3 2-3 4.1V24h-4V8z"/></svg>
            </a>
            <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2V12h2.2V9.7c0-2.2 1.3-3.4 3.3-3.4.96 0 1.96.17 1.96.17v2.15h-1.1c-1.1 0-1.45.69-1.45 1.4V12h2.47l-.4 2.9h-2.07v7A10 10 0 0022 12z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5.5A4.5 4.5 0 1016.5 12 4.5 4.5 0 0012 7.5zM18.5 6a1 1 0 11-1 1 1 1 0 011-1z"/></svg>
            </a>
            <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A12 12 0 000 12.6c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.6-1.4-2-1.4-2-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.2 1.9 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.3 11.3 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.6-2.7 5.6-5.3 5.9.4.3.7 1 .7 2v3c0 .3.2.7.8.6A12 12 0 0024 12.6 12 12 0 0012 .5z"/></svg>
            </a>
          </div>
        </div>

        {/* Platform */}
  <div className="md:col-span-2">
          <div className="font-semibold text-sm text-white">Platform</div>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            {platformLinks.map((l) => <li key={l}><Link href="#">{l}</Link></li>)}
          </ul>
        </div>

        {/* Resources */}
  <div className="md:col-span-2">
          <div className="font-semibold text-sm text-white">Resources</div>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            {resourceLinks.map((l) => <li key={l}><Link href="#">{l}</Link></li>)}
          </ul>
        </div>

        {/* Company */}
  <div className="md:col-span-2">
          <div className="font-semibold text-sm text-white">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-white/90">
            {companyLinks.map((l) => <li key={l}><Link href="#">{l}</Link></li>)}
          </ul>
        </div>

        {/* Newsletter (col 6) */}
        <div className="md:col-span-3">
          <div className="font-semibold text-sm text-white">Stay Updated</div>
          <p className="text-sm text-white/90 mt-2">Get the latest courses and updates.</p>

          <div className="mt-4 flex gap-2 items-center">
            <label htmlFor="footer-email" className="sr-only">Email</label>
            <div className="flex flex-1 min-w-0">
              <input id="footer-email" aria-label="Email address" type="email" placeholder="Enter your email" className="h-11 px-4 rounded-l-md border border-white/20 focus:outline-none focus:ring-4 focus:ring-white/20 bg-white text-[var(--primary)] flex-1 min-w-0" />
              <Button className="h-11 rounded-r-md bg-white text-[var(--primary)] px-4">Subscribe</Button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[var(--primary)]">🔒</div>
              <div>SSL Secure</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[var(--primary)]">🛡️</div>
              <div>GDPR</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/90">© {new Date().getFullYear()} LearnMicro. All rights reserved.</div>

          <div className="hidden md:flex items-center gap-6 text-white/90">
            <div className="flex items-center gap-4 text-sm"><span>SSL Secure</span></div>
            <div className="flex items-center gap-4 text-sm"><span>GDPR</span></div>
            <div className="flex items-center gap-4 text-sm"><span>ISO</span></div>
          </div>

          <div className="text-sm text-white/90">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <span className="px-3">|</span>
            <Link href="#" className="hover:text-white">Terms</Link>
            <span className="px-3">|</span>
            <Link href="#" className="hover:text-white">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
