'use client'

/**
 * Optimized Image Component
 * 
 * Enhanced Next.js Image with:
 * - Automatic format optimization (WebP/AVIF)
 * - Lazy loading
 * - Blur placeholder
 * - Error handling
 * - Loading states
 */

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { Loader2, ImageOff } from 'lucide-react'

interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallback?: string
  showLoader?: boolean
  onLoadingComplete?: () => void
  errorComponent?: React.ReactNode
}

export function OptimizedImage({
  src,
  alt,
  fallback,
  showLoader = true,
  onLoadingComplete,
  errorComponent,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleLoad = () => {
    setLoading(false)
    onLoadingComplete?.()
  }

  const handleError = () => {
    setError(true)
    setLoading(false)
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>
    }

    if (fallback) {
      return (
        <Image
          src={fallback}
          alt={alt}
          className={className}
          onError={() => {}} // Prevent infinite error loop
          {...props}
        />
      )
    }

    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width: props.width, height: props.height }}
      >
        <ImageOff className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="relative">
      {loading && showLoader && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          aria-label="Loading image"
        >
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-hidden="true" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        onLoad={handleLoad}
        onError={handleError}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
        {...props}
      />
    </div>
  )
}

/**
 * Avatar Image Component
 * Optimized for profile pictures
 */
interface AvatarImageProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallbackText?: string
}

export function AvatarImage({ 
  src, 
  alt, 
  size = 'md',
  fallbackText 
}: AvatarImageProps) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 96,
  }

  const dimension = sizes[size]

  if (!src) {
    const initials = fallbackText
      ? fallbackText.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : '?'

    return (
      <div
        className={`flex items-center justify-center bg-blue-600 text-white font-semibold rounded-full`}
        style={{ width: dimension, height: dimension }}
        aria-label={alt}
      >
        {initials}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className="rounded-full object-cover"
      fallback="/images/default-avatar.png"
    />
  )
}
