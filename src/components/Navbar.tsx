'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { FileText } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      <div className="px-6">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-500" />
            <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
              BillReduce
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
