'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, MessageSquare, FileCheck, Book, Image, Sparkles, Shield, Clock, Heart, LogIn } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/features/auth'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" role="status" aria-label="Loading">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto" role="main">
      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800" aria-labelledby="hero-heading">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm text-blue-700 dark:text-blue-300 font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Healthcare & Pregnancy Journey Platform
          </div>
          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Your AI Assistant for
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Medical Bills & Life Moments
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
            Negotiate medical bills with AI-powered assistance and create beautiful pregnancy journey storybooks. 
            Two powerful tools in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-base shadow-lg hover:shadow-xl transition-all"
              aria-label="Sign in to get started"
            >
              <LogIn className="w-5 h-5" aria-hidden="true" />
              Sign In to Get Started
            </button>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 font-semibold rounded-lg text-base transition-all"
              aria-label="Learn more about our features"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section id="features" className="py-16 px-6" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Two Powerful Features, One Platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you're managing healthcare costs or documenting life's precious moments, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Bill Negotiation Feature */}
            <article className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Medical Bill Negotiation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Reduce your medical bills with AI-powered negotiation assistance. Upload bills, chat with AI, and get professional messages.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Upload Bills</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Support for images and PDFs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">AI Analysis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">GPT-5 powered insights</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Draft Messages</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Professional negotiation templates</p>
                  </div>
                </div>
              </div>
            </article>

            {/* Pregnancy Storybook Feature */}
            <article className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Pregnancy Storybook
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create beautiful AI-powered pregnancy journey storybooks. Upload photos, generate stories, and preserve memories forever.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <Image className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Upload Photos</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add captions and memories</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">AI Story Generation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">4 tone options: sweet, humorous, poetic, journalistic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Export & Share</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Download as PDF or share online</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800" aria-labelledby="benefits-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="benefits-heading" className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is encrypted and stored securely with Firebase. We never share your information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Leveraging GPT-5 and advanced AI models for intelligent assistance and creative storytelling.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Save Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get professional results in minutes, not hours. Focus on what matters most to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600" aria-labelledby="cta-heading">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of users managing healthcare costs and preserving precious memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg text-base shadow-lg transition-all"
              aria-label="Sign in now"
            >
              <LogIn className="w-5 h-5" aria-hidden="true" />
              Sign In Now
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-8 py-4 border-2 border-white hover:bg-white/10 text-white font-semibold rounded-lg text-base transition-all"
              aria-label="Create free account"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
