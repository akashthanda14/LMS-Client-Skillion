"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const FOUNDER_IMG = "https://res.cloudinary.com/dmt4dj8ft/image/upload/v1758031163/Gemini_Generated_Image_fz8x5zfz8x5zfz8x_1_vdlywf.png";

const OWNER_NAME = "Akashdeep Thanda";
const OWNER_DESCRIPTION = `Akashdeep Thanda is the founder of Dolchico.com, a production-ready e-commerce platform built with modern web technologies. With hands-on experience in full-stack development and a strong foundation in backend engineering, Akashdeep specializes in building scalable, secure web applications using Node.js, Express, PostgreSQL, and React/Next.js.

Starting as a Full-Stack Web Development Intern at Compass Technologies in Chandigarh, Akashdeep quickly developed expertise in authentication systems, REST API design, and production-grade development practices. Since June 2025, he has been leading the development of Dolchico.com, shipping over 60 REST APIs with features including payment gateway integration, OAuth authentication, and real-time inventory management.

Beyond building products, Akashdeep is passionate about solving real-world problems through code. He won 1st place at the Web-e-Stan 2.0 Hackathon among 700+ competitors and has worked with international clients to deliver custom web solutions. Currently pursuing Computer Science Engineering at Lovely Professional University, he combines academic knowledge with practical development skills to create technology that makes a difference.

When not coding, Akashdeep focuses on fitness, creating content, and continuously learning new technologies to stay ahead in the fast-moving world of web development.`;

export default function Pricing() {
  const [expanded, setExpanded] = useState(false);
  const shortLimit = 260;
  const shortBio = OWNER_DESCRIPTION.length > shortLimit ? OWNER_DESCRIPTION.slice(0, shortLimit).trim() + '…' : OWNER_DESCRIPTION;

  return (
    <div className="text-slate-900">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white rounded-lg shadow-sm p-6 md:p-10">
          {/* Left: rounded photo */}
          <div className="flex-shrink-0">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105">
                <img src={FOUNDER_IMG} alt={OWNER_NAME} className="w-full h-full object-cover object-top" />
              </div>
          </div>

          {/* Right: short intro + socials */}
          <div className="flex-1 text-left">
            <h2 className="text-2xl font-semibold">{OWNER_NAME}</h2>
            <p className="mt-3 text-sm text-slate-700 max-w-prose">
              {expanded ? OWNER_DESCRIPTION : shortBio}
            </p>

            {OWNER_DESCRIPTION.length > shortLimit && (
              <button
                onClick={() => setExpanded((s) => !s)}
                className="mt-3 text-sm text-[var(--primary-blue)] hover:underline font-medium"
                aria-expanded={expanded}
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}

            <div className="mt-4 flex items-center gap-4">
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
                <img src="https://res.cloudinary.com/dnyv7wabr/image/upload/v1757751534/youtube_b9borz.png" alt="YouTube" className="w-6 h-6" />
                YouTube
              </a>

              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
                <img src="https://res.cloudinary.com/dnyv7wabr/image/upload/v1757750774/instagram_voftum.png" alt="Instagram" className="w-6 h-6" />
                Instagram
              </a>

              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
                <img src="https://res.cloudinary.com/dnyv7wabr/image/upload/v1757750717/facebook_yn82x7.png" alt="Facebook" className="w-6 h-6" />
                Facebook
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
