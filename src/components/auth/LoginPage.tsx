'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Mail, Lock } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard',
    })

    if (result?.error) {
      setError('Invalid email or password')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-navy relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="text-white/90 font-heading text-lg font-semibold tracking-tight">
                Southern Cities
              </span>
            </div>
            
            <h1 className="font-heading text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
              Permit Portal
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Streamline your construction permit process. Submit, track, and manage 
              all your permits from one centralized dashboard.
            </p>
          </div>

          <div className="mt-16 space-y-6 opacity-0 animate-fade-up-delay-2">
            {[
              { title: 'AI-Powered Analysis', desc: 'Smart document analysis catches issues before submission' },
              { title: 'Real-Time Tracking', desc: 'Monitor every stage of your permit lifecycle' },
              { title: 'County Integration', desc: 'Direct submission to county permitting offices' },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-2.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">{feature.title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-navy rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-navy-900 text-lg font-bold">
              Permit Portal
            </span>
          </div>

          <div className="opacity-0 animate-fade-up">
            <h2 className="font-heading text-3xl font-extrabold text-navy-900 mb-2">
              Welcome back
            </h2>
            <p className="text-navy-900/50 text-base mb-8">
              Sign in to manage your construction permits
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm animate-scale-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mb-8 opacity-0 animate-fade-up-delay-1">
            <div>
              <label className="block text-sm font-medium text-navy-900/70 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-900/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-navy-100 rounded-xl text-navy-900 placeholder:text-navy-900/30 transition-all duration-200 hover:border-navy-200"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-900/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-900/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-navy-100 rounded-xl text-navy-900 placeholder:text-navy-900/30 transition-all duration-200 hover:border-navy-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-400 hover:bg-orange-500 disabled:bg-navy-100 disabled:text-navy-300 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 btn-glow flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative mb-8 opacity-0 animate-fade-up-delay-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#f8f9fc] text-navy-900/40 font-medium">or</span>
            </div>
          </div>

          <div className="opacity-0 animate-fade-up-delay-3">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full border border-navy-100 hover:border-navy-200 hover:bg-white text-navy-900 font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="text-center text-navy-900/40 text-sm mt-8 opacity-0 animate-fade-up-delay-4">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-orange-400 hover:text-orange-500 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
