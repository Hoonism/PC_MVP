/**
 * Image Optimization Utilities
 * 
 * Provides utilities for:
 * - Image compression
 * - Format conversion
 * - Responsive images
 * - CDN integration
 * - Lazy loading
 */

// ============================================================================
// Types
// ============================================================================

export interface ImageOptimizationOptions {
  quality?: number
  width?: number
  height?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface CDNConfig {
  baseUrl: string
  enabled: boolean
  domains: string[]
}

// ============================================================================
// Configuration
// ============================================================================

const CDN_CONFIG: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_URL || '',
  enabled: !!process.env.NEXT_PUBLIC_CDN_URL,
  domains: ['images.unsplash.com', 'cdn.example.com'],
}

// ============================================================================
// CDN URL Generation
// ============================================================================

/**
 * Generate optimized image URL
 * Works with Next.js Image Optimization API or external CDN
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  // If it's already an optimized URL, return as-is
  if (src.startsWith('/_next/image')) {
    return src
  }

  // Use CDN if configured
  if (CDN_CONFIG.enabled && CDN_CONFIG.baseUrl) {
    return getCDNImageUrl(src, options)
  }

  // Use Next.js Image Optimization
  return getNextImageUrl(src, options)
}

/**
 * Get Next.js optimized image URL
 */
function getNextImageUrl(
  src: string,
  options: ImageOptimizationOptions
): string {
  const params = new URLSearchParams()
  
  params.set('url', src)
  
  if (options.width) {
    params.set('w', options.width.toString())
  }
  
  if (options.quality) {
    params.set('q', options.quality.toString())
  }

  return `/_next/image?${params.toString()}`
}

/**
 * Get CDN image URL with transformations
 */
function getCDNImageUrl(
  src: string,
  options: ImageOptimizationOptions
): string {
  const { width, height, quality = 75, format = 'webp', fit = 'cover' } = options
  
  // Example for Cloudinary-style CDN
  const transformations = []
  
  if (width || height) {
    const dimensions = [
      width ? `w_${width}` : '',
      height ? `h_${height}` : '',
      `c_${fit}`,
    ].filter(Boolean).join(',')
    transformations.push(dimensions)
  }
  
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)
  
  const transformStr = transformations.join(',')
  
  // Construct CDN URL
  return `${CDN_CONFIG.baseUrl}/${transformStr}/${src}`
}

// ============================================================================
// Responsive Image Helpers
// ============================================================================

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
): string {
  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { width })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => {
      if (breakpoint === 'default') {
        return size
      }
      return `(max-width: ${breakpoint}) ${size}`
    })
    .join(', ')
}

// ============================================================================
// Client-Side Image Compression
// ============================================================================

/**
 * Compress image file on client side before upload
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'image/jpeg' | 'image/webp' | 'image/png'
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    format = 'image/jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        format,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Convert image to WebP format
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.8
): Promise<Blob> {
  return compressImage(file, {
    format: 'image/webp',
    quality,
  })
}

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

/**
 * Check if browser supports native lazy loading
 */
export function supportsNativeLazyLoading(): boolean {
  if (typeof window === 'undefined') return false
  return 'loading' in HTMLImageElement.prototype
}

/**
 * Get blur data URL for placeholder
 */
export function getBlurDataURL(width: number = 10, height: number = 10): string {
  // Generate a simple gray blur placeholder
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
  }
  
  return canvas.toDataURL()
}

// ============================================================================
// Image Validation
// ============================================================================

/**
 * Validate image file
 */
export function validateImage(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  } = options

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return Promise.resolve({
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    })
  }

  // Check file size
  if (file.size > maxSize) {
    return Promise.resolve({
      valid: false,
      error: `File too large. Max size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
    })
  }

  // Check dimensions if specified
  if (options.maxWidth || options.maxHeight) {
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        if (options.maxWidth && img.width > options.maxWidth) {
          resolve({
            valid: false,
            error: `Image width exceeds ${options.maxWidth}px`,
          })
          return
        }
        
        if (options.maxHeight && img.height > options.maxHeight) {
          resolve({
            valid: false,
            error: `Image height exceeds ${options.maxHeight}px`,
          })
          return
        }
        
        resolve({ valid: true })
      }
      
      img.onerror = () => {
        resolve({ valid: false, error: 'Failed to load image' })
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  return Promise.resolve({ valid: true })
}

// ============================================================================
// Preload Critical Images
// ============================================================================

/**
 * Preload critical images for better performance
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Preload multiple images
 */
export function preloadImages(sources: string[]): Promise<void[]> {
  return Promise.all(sources.map(preloadImage))
}

// ============================================================================
// Exports
// ============================================================================

export const imageOptimization = {
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  compressImage,
  convertToWebP,
  validateImage,
  preloadImage,
  preloadImages,
  supportsNativeLazyLoading,
  getBlurDataURL,
}
