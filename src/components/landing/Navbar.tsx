"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar({ forceTransparent = false }: { forceTransparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#services', label: 'Services' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  const isScrolled = forceTransparent ? false : scrolled;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${isScrolled ? 'backdrop-blur-md bg-white/95 border-b border-[rgba(13,110,253,0.06)] shadow-lg' : 'bg-transparent'}`}>
      {/* Accessible skip links for each primary nav target - visible on keyboard focus */}
      <div className="sr-only focus:not-sr-only flex flex-col p-2 gap-1">
        <a href="#home" className="p-2 rounded bg-white/95 text-[var(--primary)]">Skip to Home</a>
        {navLinks.map((l) => (
          <a key={l.href} href={l.href} className="p-2 rounded bg-white/95 text-[var(--primary)]">Skip to {l.label}</a>
        ))}
        <a href="#main" className="p-2 rounded bg-white/95 text-[var(--primary)]">Skip to main content</a>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav role="navigation" aria-label="Main navigation" className="flex items-center justify-between h-20 md:h-20">
          {/* Left: Logo */}
          <div className="flex items-center gap-4">
              <Link href="/" className={`flex items-center gap-3 focus:outline-none focus:ring-4 focus:ring-[rgba(13,110,253,0.12)] rounded`}>
              <span className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--primary)]" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7v6c0 5 4 9 8 9s8-4 8-9V7l-8-4z" fill="#fff"/></svg>
              </span>
              <span className={`text-[20px] font-bold ${isScrolled ? 'text-[#1a1f36]' : 'text-white'}`}>LearnMicro</span>
            </Link>
            {/* Desktop center links */}
      <div className={`hidden lg:flex items-center gap-6 text-sm ml-6 ${isScrolled ? 'text-[#4a5568]' : 'text-white'}`}>
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className={`relative px-2 py-1 hover:text-[var(--primary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.12)] ${isScrolled ? '' : 'text-white'}`} aria-current={false}>
                  <span className="inline-block">{l.label}</span>
                  <span className="absolute left-1/2 -bottom-1 w-0 h-0.5 bg-[var(--primary)] transition-all"></span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: CTAs and mobile toggle */}
          <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className={`text-sm hover:text-[var(--primary)] focus:outline-none focus:ring-4 focus:ring-[rgba(13,110,253,0.08)] rounded ${isScrolled ? 'text-[#4a5568]' : 'text-white'}`}>Sign In</Link>
              <Button asChild size="sm">
                <Link href="/register" className={`h-11 px-4 rounded-md ${isScrolled ? '' : 'bg-[var(--primary)] text-white'}`}>Get Started</Link>
              </Button>
            </div>

            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
              className={`md:hidden p-2 rounded-md focus:outline-none focus:ring-4 focus:ring-[rgba(13,110,253,0.12)] ${isScrolled ? 'text-[var(--primary)]' : 'text-white'}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div aria-hidden={!open} className={`fixed top-0 right-0 h-full w-[320px] bg-white shadow-lg transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'} focus:outline-none`}>
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--primary)] text-white">LM</span>
            <div className="font-semibold text-lg">LearnMicro</div>
          </div>
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded focus:outline-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="p-4 overflow-auto">
          <nav className="flex flex-col gap-6" aria-label="Mobile navigation">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-lg text-[#1a1f36]">{l.label}</a>
            ))}
          </nav>

          <div className="mt-8">
            <Link href="/login" className="block text-sm text-[#4a5568] mb-3">Sign In</Link>
            <Button asChild className="w-full"><Link href="/register">Get Started</Link></Button>
          </div>
        </div>
      </div>
    </header>
  );
}
