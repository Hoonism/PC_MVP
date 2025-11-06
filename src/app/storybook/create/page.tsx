'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { StorybookCreate } from '@/components/features/storybook'
import { Loader2 } from 'lucide-react'

function CreateStorybookContent() {
  const searchParams = useSearchParams()
  const storybookId = searchParams.get('id')

  return <StorybookCreate storybookId={storybookId} />
}

export default function CreateStorybookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <CreateStorybookContent />
    </Suspense>
  )
}
