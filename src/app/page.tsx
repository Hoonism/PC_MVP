import Link from 'next/link'
import { Upload, MessageSquare, FileCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-gray-100 mb-5">
            Reduce Your Medical Bills
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Draft professional negotiation messages with AI assistance. Simple and effective.
          </p>
          <Link
            href="/chat"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                1. Upload Bill
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your medical bill as an image or PDF for analysis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                2. Chat with AI
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discuss your situation and get guidance through the process.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                3. Get Message
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive a professional message to send to your billing department.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Ready to Start?
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
            Start reducing your medical bills today.
          </p>
          <Link
            href="/chat"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  )
}
