'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { storybookService, StorybookData } from '@/services/storybookService'
import { ArrowLeft, Loader2, Upload, X, Save, Download, Eye } from 'lucide-react'

interface StorybookCreateProps {
  storybookId?: string | null
}

interface FormData {
  text: string
  images: File[]
  textFiles: File[]
  tone: string
}

interface ImageWithCaption {
  file: File
  preview: string
  caption: string
  broken?: boolean
  existingUrl?: string
}

export default function StorybookCreate({ storybookId }: StorybookCreateProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    text: '',
    images: [],
    textFiles: [],
    tone: 'sweet'
  })
  const [imagesWithCaptions, setImagesWithCaptions] = useState<ImageWithCaption[]>([])
  const [storybookName, setStorybookName] = useState<string>('')
  const [generatedText, setGeneratedText] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingStoredImages, setIsLoadingStoredImages] = useState(false)
  const [initialData, setInitialData] = useState<StorybookData | null>(null)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isAutoSavingRef = useRef(false)

  useEffect(() => {
    if (storybookId && user) {
      loadStorybook(storybookId)
    }
  }, [storybookId, user])

  // Auto-save effect
  useEffect(() => {
    if (!user || !storybookName.trim()) {
      return
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveStorybook()
    }, 3000) // 3 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, storybookName, generatedText, imagesWithCaptions, user])

  const loadStorybook = async (id: string) => {
    try {
      const storybook = await storybookService.getStorybook(id)
      if (storybook) {
        setInitialData(storybook)
        setStorybookName(storybook.name)
        setFormData({
          text: storybook.input?.text || '',
          images: [],
          textFiles: [],
          tone: storybook.input?.tone || 'sweet'
        })
        setGeneratedText(storybook.output?.generatedText || '')

        if (storybook.input?.images && storybook.input.images.length > 0) {
          setIsLoadingStoredImages(true)
          const loadedImages = await Promise.all(
            storybook.input.images.map(async (imageData) => {
              try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageData.url)}`
                const response = await fetch(proxyUrl)
                if (response.ok) {
                  const blob = await response.blob()
                  const file = new File([blob], imageData.name, { type: blob.type })
                  return {
                    file,
                    preview: URL.createObjectURL(blob),
                    caption: imageData.caption,
                    existingUrl: imageData.url
                  }
                }
                throw new Error('Failed to load')
              } catch (error) {
                return {
                  file: new File([new Blob()], imageData.name, { type: 'image/jpeg' }),
                  preview: '',
                  caption: imageData.caption,
                  broken: true,
                  existingUrl: imageData.url
                }
              }
            })
          )
          setImagesWithCaptions(loadedImages)
          setFormData((prev) => ({ ...prev, images: loadedImages.map((img) => img.file) }))
          setIsLoadingStoredImages(false)
        }
      }
    } catch (error) {
      console.error('Error loading storybook:', error)
    }
  }

  const autoSaveStorybook = async () => {
    if (!user || !storybookName.trim()) return
    
    // Prevent concurrent saves
    if (isAutoSavingRef.current || isSaving) return
    isAutoSavingRef.current = true

    try {
      const captions = imagesWithCaptions.map((img) => img.caption)
      const existingImageUrls: string[] = []
      const generatedImageUrls: string[] = []

      imagesWithCaptions.forEach((img, index) => {
        if (img.existingUrl) {
          const isAlreadySaved = initialData && initialData.input?.images?.[index]?.url === img.existingUrl
          if (isAlreadySaved) {
            existingImageUrls.push(img.existingUrl)
          } else {
            existingImageUrls.push('')
            generatedImageUrls.push(img.existingUrl)
          }
        } else {
          existingImageUrls.push('')
        }
      })

      const saveData = {
        ...formData,
        captions,
        existingImageUrls
      }

      if (initialData && initialData.id) {
        await storybookService.updateStorybook(
          initialData.id,
          user.uid,
          storybookName,
          saveData,
          generatedText,
          generatedImageUrls
        )
      } else {
        const newId = await storybookService.saveStorybook(
          user.uid,
          storybookName,
          saveData,
          generatedText,
          generatedImageUrls
        )
        // Update initialData so future saves are updates
        if (!initialData) {
          const savedStorybook = await storybookService.getStorybook(newId)
          setInitialData(savedStorybook)
        }
      }

      setLastAutoSave(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isAutoSavingRef.current = false
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: ''
    }))
    setImagesWithCaptions((prev) => [...prev, ...newImages])
  }

  const handleCaptionChange = (index: number, caption: string) => {
    setImagesWithCaptions((prev) => prev.map((img, i) => (i === index ? { ...img, caption } : img)))
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagesWithCaptions[index].preview)
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
    setImagesWithCaptions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateStory = async () => {
    setIsGenerating(true)
    setGeneratedText('')
    setGenerationProgress('Generating your story...')

    try {
      const captions = imagesWithCaptions.map((img) => img.caption).filter((caption) => caption.trim())

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formData.text,
          tone: formData.tone,
          imageCount: formData.images.length,
          captions
        })
      })

      const result = await response.json()
      if (result.success) {
        setGeneratedText(result.generatedText)
        alert('Story generated successfully!')
      } else {
        alert('Error generating story: ' + result.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate story. Please try again.')
    } finally {
      setIsGenerating(false)
      setGenerationProgress('')
    }
  }

  const handleSave = async () => {
    if (!storybookName.trim()) {
      alert('Please enter a name for your storybook')
      return
    }
    if (!user) return

    setIsSaving(true)
    try {
      const captions = imagesWithCaptions.map((img) => img.caption)
      const existingImageUrls: string[] = []
      const generatedImageUrls: string[] = []

      imagesWithCaptions.forEach((img, index) => {
        if (img.existingUrl) {
          const isAlreadySaved = initialData && initialData.input?.images?.[index]?.url === img.existingUrl
          if (isAlreadySaved) {
            existingImageUrls.push(img.existingUrl)
          } else {
            existingImageUrls.push('')
            generatedImageUrls.push(img.existingUrl)
          }
        } else {
          existingImageUrls.push('')
        }
      })

      const saveData = {
        ...formData,
        captions,
        existingImageUrls
      }

      if (initialData && initialData.id) {
        await storybookService.updateStorybook(
          initialData.id,
          user.uid,
          storybookName,
          saveData,
          generatedText,
          generatedImageUrls
        )
      } else {
        const newId = await storybookService.saveStorybook(user.uid, storybookName, saveData, generatedText, generatedImageUrls)
        // Update initialData so it becomes an update next time
        const savedStorybook = await storybookService.getStorybook(newId)
        setInitialData(savedStorybook)
      }

      setLastAutoSave(new Date())
      alert('Storybook saved successfully!')
      router.push('/storybook')
    } catch (error) {
      console.error('Error saving storybook:', error)
      alert('Failed to save storybook. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-[#212121]">
      <div className="bg-white dark:bg-[#2f2f2f] border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/storybook')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {initialData ? 'Edit Storybook' : 'New Storybook'}
                </h1>
                {lastAutoSave && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Auto-saved at {lastAutoSave.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving || !storybookName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storybook Name</label>
            <input
              type="text"
              value={storybookName}
              onChange={(e) => setStorybookName(e.target.value)}
              placeholder="Enter a name for your storybook..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Story Tone</label>
            <select
              value={formData.tone}
              onChange={(e) => setFormData((prev) => ({ ...prev, tone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="sweet">Sweet and Sentimental</option>
              <option value="humorous">Humorous and Honest</option>
              <option value="journalistic">Journalistic and Milestone-Focused</option>
              <option value="poetic">Poetic and Reflective</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Memories & Notes
            </label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="Share your pregnancy journey moments..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photos</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-3" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Click to upload photos</span>
              </label>
            </div>
          </div>

          {isLoadingStoredImages && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Loading your saved photos...
            </div>
          )}

          {imagesWithCaptions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Photos ({imagesWithCaptions.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagesWithCaptions.map((imageObj, index) => (
                  <div key={index} className="relative group bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    {!imageObj.broken ? (
                      <img
                        src={imageObj.existingUrl || imageObj.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-48 object-contain rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-400">Image unavailable</span>
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={imageObj.caption}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleGenerateStory}
            disabled={isGenerating || (!formData.text.trim() && formData.images.length === 0)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                {generationProgress}
              </>
            ) : (
              'Generate Story'
            )}
          </button>

          {generatedText && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Your Generated Story</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{generatedText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
