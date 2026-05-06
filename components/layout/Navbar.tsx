'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isDashboard = pathname === '/' || 
                      pathname?.startsWith('/security') || 
                      pathname?.startsWith('/personal-info') || 
                      pathname?.startsWith('/products') || 
                      pathname?.startsWith('/delete-account')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isDashboard) return null;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        !menuOpen
          ? 'bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#1F1F1F]'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <Image
            src="/assets/favicon.png"
            alt="SAMKIEL"
            width={32}
            height={32}
            className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
            priority  
          />
          <span className="text-xl font-bold text-white tracking-tighter font-syne">SAMKIEL <span className="text-[#E8FF47]">ID</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="https://samkiel.tech"
            className="text-sm font-medium text-[#A1A1AA] transition-colors duration-200 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-[#A1A1AA] transition-colors duration-200 hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#E8FF47] px-6 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:bg-[#d4eb3a] hover:shadow-[0_0_20px_rgba(232,255,71,0.3)] active:scale-95"
          >
            Create Account
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center text-white md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-0 z-50 flex flex-col bg-[#0A0A0A] p-6 md:hidden">
          <div className="flex items-center justify-between mb-12">
             <Link href="/" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2.5">
              <Image src="/assets/favicon.png" alt="SAMKIEL" width={32} height={32} />
              <span className="text-xl font-bold text-white font-syne">SAMKIEL <span className="text-[#E8FF47]">ID</span></span>
            </Link>
            <button onClick={() => setMenuOpen(false)} className="text-white">
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-6">
            <Link href="https://samkiel.tech" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-white">Home</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-white">Sign In</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="text-2xl font-semibold text-[#E8FF47]">Create Account</Link>
          </nav>
        </div>
      )}
    </nav>
  )
}
