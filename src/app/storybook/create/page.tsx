'use client'

import { useSearchParams } from 'next/navigation'
import StorybookCreate from '@/components/StorybookCreate'

export default function CreateStorybookPage() {
  const searchParams = useSearchParams()
  const storybookId = searchParams.get('id')

  return <StorybookCreate storybookId={storybookId} />
}
