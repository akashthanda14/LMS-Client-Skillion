"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "./Navbar";
import Stats from "./Stats";
import FeaturesGrid from "./FeaturesGrid";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import EmailCTA from "./EmailCTA";
import Footer from "./Footer";
import Pricing from "./Pricing";

export default function HeroSection() {
  return (
  <main id="main" className="min-h-screen w-full antialiased text-slate-900">
      <Navbar />

  <section id="home"
        className="relative h-screen w-full bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1612117229486-78abff6d84c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}
        role="img"
        aria-label="Person learning on a laptop with soft gradient background"
      >
        {/* gradient overlay to ensure text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/70 to-black/30 mix-blend-multiply" aria-hidden />
        {/* inset shadow overlay to darken edges and improve contrast */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 80px 120px rgba(0,0,0,0.45), inset 0 -80px 120px rgba(0,0,0,0.25)',
          }}
        />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-8 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-8 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 h-full flex items-center">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-extrabold leading-tight"
            >
              Learn without limits skills that move your career forward
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 text-lg text-white/90"
            >
              Bite-sized courses, AI-guided learning paths, and certificates trusted by teams worldwide.
            </motion.p>

            <motion.div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link href="/register" className="inline-block">
                <button className="px-6 py-3 rounded-lg bg-white text-[var(--primary)] font-semibold shadow-lg hover:shadow-xl transition">Get started</button>
              </Link>
              <Link href="/login" className="inline-block">
                <button className="px-6 py-3 rounded-lg bg-white/20 border border-white/30 text-white hover:bg-white/30 transition">Sign in</button>
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Stats separated from hero */}
      <section id="stats" className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Stats />
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <FeaturesGrid />
        </div>
      </section>

      <section id="services" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <HowItWorks />
        </div>
      </section>

      <section id="testimonials" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Testimonials />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <FAQ />
        </div>
      </section>

      <section id="about" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Pricing />
        </div>
      </section>

      <section id="contact" className="bg-gradient-to-br from-[var(--primary)]/10 to-transparent py-20">
        <div className="max-w-6xl mx-auto px-6">
          <EmailCTA />
        </div>
      </section>

      <Footer />
    </main>
  );
}
