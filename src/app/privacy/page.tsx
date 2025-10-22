export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Privacy Policy
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Last updated: October 11, 2025
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Information We Collect
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We collect information that you provide directly to us, including when you upload medical bills
            and interact with our AI assistant.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your information is used solely to provide you with AI-powered assistance in negotiating your
            medical bills. We do not share your personal information with third parties.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3. Data Security
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We implement appropriate security measures to protect your personal information from unauthorized
            access, alteration, or destruction.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            4. Contact Us
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            If you have any questions about this Privacy Policy, please contact us at privacy@billnegotiate.ai
          </p>
        </section>
      </div>
    </div>
  )
}
