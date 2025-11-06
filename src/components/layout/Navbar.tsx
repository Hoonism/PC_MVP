'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ui'
import { FileText, LogIn, LogOut, User, LayoutDashboard, MessageSquare, Book } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/features/auth'

export function Navbar() {
  const { user, logout } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700" role="navigation" aria-label="Main navigation">
        <div className="px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity" aria-label="BillReduce home">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  BillReduce
                </span>
              </Link>
              {user && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-current={pathname === '/dashboard' ? 'page' : undefined}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <Link
                    href="/chat"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                      pathname === '/chat'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-current={pathname === '/chat' ? 'page' : undefined}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Bill Chat</span>
                  </Link>
                  <Link
                    href="/storybook"
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                      pathname?.startsWith('/storybook')
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-current={pathname?.startsWith('/storybook') ? 'page' : undefined}
                  >
                    <Book className="w-4 h-4" />
                    <span className="hidden sm:inline">Storybook</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  aria-label="Sign in"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
