export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Terms of Service
      </h1>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Last updated: October 11, 2025
        </p>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            By accessing and using BillNegotiate AI, you accept and agree to be bound by the terms and
            provisions of this agreement.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            2. Use of Service
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Our service provides AI-generated suggestions for negotiating medical bills. The content provided
            is for informational purposes only and should not be considered legal or financial advice.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            3. User Responsibilities
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You are responsible for maintaining the confidentiality of your account and for all activities
            that occur under your account.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            4. Limitation of Liability
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            BillNegotiate AI shall not be liable for any indirect, incidental, special, consequential, or
            punitive damages resulting from your use of the service.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            5. Contact Information
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            For questions about these Terms of Service, please contact us at legal@billnegotiate.ai
          </p>
        </section>
      </div>
    </div>
  )
}
