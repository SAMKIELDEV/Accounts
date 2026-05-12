'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
)

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const socials = [
  { label: 'Email', href: 'mailto:hello@samkiel.tech', icon: <Mail size={16} />, external: false },
  { label: 'GitHub', href: 'https://github.com/SAMKIELDEV', icon: <GithubIcon />, external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/samkiell/', icon: <LinkedinIcon />, external: true },
]

const productLinks = [
  { label: 'Kiv', href: 'https://samkiel.tech/studio/kiv' },
]

const companyLinks = [
  { label: 'About', href: 'https://samkiel.tech/#about' },
  { label: 'Agency', href: 'https://samkiel.tech/#agency' },
  { label: 'Work', href: 'https://samkiel.tech/work' },
]

const legalLinks = [
  { label: 'Terms', href: 'https://samkiel.tech/terms' },
  { label: 'Privacy', href: 'https://samkiel.tech/privacy' },
]

export const Footer = () => {
  return (
    <motion.footer
      className="relative bg-[#0A0A0A]"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {/* Top border with accent gradient fade */}
      <div className="relative h-px w-full bg-[#27272A]">
        <div className="absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-[#E8FF47]/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1280px] px-6 pb-12 pt-20 md:px-12 lg:px-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-20">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="https://samkiel.tech" className="inline-block">
              <Image
                src="/assets/SAMKIEL_LOGO.png"
                alt="SAMKIEL"
                width={160}
                height={40}
                className="h-9 w-auto"
                priority
              />
            </a>
            <p className="mt-2 text-sm text-[#52525B]">
              Software With Intention
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-[#3F3F46]">
              Building software that matters, from Nigeria to the world.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.external ? '_blank' : undefined}
                  rel={social.external ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#27272A] bg-transparent text-[#52525B] transition-all duration-200 hover:border-[#E8FF47]/30 hover:bg-[#E8FF47]/5 hover:text-[#E8FF47]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns — 3 across on all sizes */}
          <div className="grid grid-cols-3 gap-8 md:gap-12 lg:gap-24">

            {/* Products column */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E8FF47]">
                Products
              </p>
              <ul className="flex flex-col gap-3">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[#A1A1AA] transition-colors duration-200 hover:text-[#E8FF47]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E8FF47]">
                Company
              </p>
              <ul className="flex flex-col gap-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[#A1A1AA] transition-colors duration-200 hover:text-[#E8FF47]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#E8FF47]">
                Legal
              </p>
              <ul className="flex flex-col gap-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[#A1A1AA] transition-colors duration-200 hover:text-[#E8FF47]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-[#27272A] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-center text-[13px] text-[#52525B] sm:text-left">
              © {new Date().getFullYear()} SAMKIEL TECHNOLOGIES LTD. All rights reserved.
            </p>
            <a
              href="mailto:hello@samkiel.tech"
              className="hidden text-[13px] text-[#52525B] transition-colors duration-200 hover:text-[#E8FF47] sm:block"
            >
              hello@samkiel.tech
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
