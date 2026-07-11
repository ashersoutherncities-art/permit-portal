'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X, LayoutDashboard, Settings, BarChart3 } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = pathname?.startsWith('/admin')
  const isAdminUser = session?.user?.email === 'dariuswalton906@gmail.com'

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAdminUser ? [{ href: '/admin', label: 'Admin', icon: Settings }] : []),
  ]

  return (
    <header className="bg-gradient-navy sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="h-14 lg:h-16 flex items-center transition-transform group-hover:scale-105">
              <Image 
                src="/logos/sc-logo-02.png" 
                alt="Southern Cities Construction" 
                height={64}
                width={200}
                className="h-12 lg:h-14 w-auto"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* User + Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-400/20 rounded-full flex items-center justify-center">
                  <span className="text-orange-400 font-semibold text-sm">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-white/70 text-sm font-medium">
                  {session?.user?.name || 'User'}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white/70 hover:text-white p-2"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
            <div className="border-t border-white/10 mt-3 pt-3">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 bg-orange-400/20 rounded-full flex items-center justify-center">
                  <span className="text-orange-400 font-semibold text-sm">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-white/70 text-sm">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 px-4 py-3 text-red-300 hover:text-red-200 text-sm w-full rounded-xl hover:bg-white/5 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
