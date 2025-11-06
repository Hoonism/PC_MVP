import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            © 2025 BillReduce. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
