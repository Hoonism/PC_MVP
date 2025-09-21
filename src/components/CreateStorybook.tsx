'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getButtonClass, getInputClass, getCardClass, getHeadingClass, theme, themeStyles } from '../lib/theme';

interface FormData {
  text: string;
  images: File[];
  textFiles: File[];
  tone: string;
}

interface ImageWithCaption {
  file: File;
  preview: string;
  caption: string;
  broken?: boolean;
}

import { StorybookData } from '../lib/firestore';

interface CreateStorybookProps {
  onBackToDashboard: () => void;
  onSaveProject: (
    projectData: FormData,
    generatedText?: string,
    captions?: string[],
    generatedImageUrls?: string[],
    projectName?: string
  ) => void;
  initialData?: StorybookData;
  projectName?: string;
}

export default function CreateStorybook({ 
  onBackToDashboard, 
  onSaveProject, 
  initialData,
  projectName 
}: CreateStorybookProps) {
  const [formData, setFormData] = useState<FormData>(() => {
    if (initialData) {
      return {
        text: initialData.input?.text || '',
        images: [], // Will be populated from URLs
        textFiles: [], // Will be populated from stored data
        tone: initialData.input?.tone || 'sweet'
      };
    }
    return {
      text: '',
      images: [],
      textFiles: [],
      tone: 'sweet'
    };
  });
  const [imagesWithCaptions, setImagesWithCaptions] = useState<ImageWithCaption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [storybookName, setStorybookName] = useState<string>(projectName || '');
  const [isLoadingStoredImages, setIsLoadingStoredImages] = useState(false);

  // Initialize data when editing existing storybook
  useEffect(() => {
    if (initialData) {
      setGeneratedText(initialData.output?.generatedText || '');
      
      
      // Initialize images with captions from stored data
      if (initialData.input?.images && initialData.input.images.length > 0) {
        console.log('Loading user images from stored data:', initialData.input.images.length, 'images');
        setIsLoadingStoredImages(true);
        const imagePromises = initialData.input.images.map(async (imageData, index) => {
          try {
            console.log(`Loading image ${index + 1}:`, imageData.name, 'from URL:', imageData.url);
            
            // Use proxy endpoint to avoid CORS issues
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageData.url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Proxy failed for image ${index + 1}:`, response.status, errorText);
              throw new Error(`Failed to fetch image via proxy: ${response.status} - ${errorText}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], imageData.name, { type: blob.type });
            
            // Create a blob URL for preview to avoid CORS issues
            const previewUrl = URL.createObjectURL(blob);
            
            console.log(`Successfully loaded image ${index + 1} via proxy:`, imageData.name);
            return {
              file,
              preview: previewUrl,
              caption: imageData.caption
            };
          } catch (error) {
            console.error(`Error loading image ${index + 1} (${imageData.name}) via proxy:`, error);
            
            // Fallback: try direct URL access
            try {
              console.log(`Trying direct access for image ${index + 1}:`, imageData.url);
              const response = await fetch(imageData.url, {
                mode: 'cors',
                headers: {
                  'Accept': 'image/*,*/*;q=0.8'
                }
              });
              
              if (!response.ok) {
                throw new Error(`Direct fetch failed: ${response.status}`);
              }
              
              const blob = await response.blob();
              const file = new File([blob], imageData.name, { type: blob.type });
              const previewUrl = URL.createObjectURL(blob);
              
              console.log(`Successfully loaded image ${index + 1} via direct access:`, imageData.name);
              return {
                file,
                preview: previewUrl,
                caption: imageData.caption
              };
            } catch (fallbackError) {
              console.error(`Both proxy and direct access failed for image ${index + 1}:`, fallbackError);
              
              // Last resort: create a placeholder that shows the image is broken but preserves the caption
              return {
                file: new File([new Blob()], imageData.name, { type: 'image/jpeg' }),
                preview: '', // Empty preview will show broken image
                caption: imageData.caption,
                broken: true
              };
            }
          }
        });

        Promise.all(imagePromises).then(images => {
          const validImages = images.filter(img => img !== null) as ImageWithCaption[];
          console.log(`Loaded ${validImages.length} out of ${initialData.input.images.length} images successfully`);
          setImagesWithCaptions(validImages);
          setFormData(prev => ({
            ...prev,
            images: validImages.map(img => img.file)
          }));
        }).catch(error => {
          console.error('Error processing image promises:', error);
        }).finally(() => {
          setIsLoadingStoredImages(false);
        });
      }
    }
  }, [initialData]);

  // Cleanup stored image previews on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup stored image previews
      imagesWithCaptions.forEach((img) => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [imagesWithCaptions]);


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create new image objects with captions
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      caption: ''
    }));
    setImagesWithCaptions(prev => [...prev, ...newImages]);
  };

  const handleTextFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      textFiles: [...prev.textFiles, ...files]
    }));
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      tone: e.target.value
    }));
  };

  const handleCaptionChange = (index: number, caption: string) => {
    setImagesWithCaptions(prev => 
      prev.map((img, i) => i === index ? { ...img, caption } : img)
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newImages = [...imagesWithCaptions];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    
    setImagesWithCaptions(newImages);
    setDraggedIndex(null);
  };

  const generateNarrative = () => {
    const toneStyles = {
      sweet: {
        intro: "Our dearest little one, this is the beautiful story of your journey to us...",
        phrases: ["filled our hearts with joy", "couldn't wait to meet you", "pure magic", "so much love"]
      },
      humorous: {
        intro: "Well, here's the wonderfully weird and amazing story of how you came to be...",
        phrases: ["things got interesting", "your mom was a superhero", "the adventure began", "plot twist"]
      },
      journalistic: {
        intro: "Timeline: Your Journey to Us",
        phrases: ["milestone achieved", "development noted", "significant moment", "key event"]
      },
      poetic: {
        intro: "A new chapter began to unfold, a tiny spark, a universe of love...",
        phrases: ["like a gentle whisper", "bloomed beautifully", "painted our world", "danced in our hearts"]
      }
    };

    return toneStyles[formData.tone as keyof typeof toneStyles] || toneStyles.sweet;
  };

  const exportToPDF = async () => {
    const previewElement = document.getElementById('storybook-preview');
    if (!previewElement) return;

    try {
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`journey-book-${formData.tone}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(imagesWithCaptions[index].preview);
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagesWithCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const removeTextFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      textFiles: prev.textFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    console.log('Form Data:', {
      text: formData.text,
      imageCount: formData.images.length,
      images: formData.images
    });

    // Here you would typically send the data to your API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Form submitted successfully!');
    setIsSubmitting(false);
  };

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setGeneratedText('');

    try {
      const captions = imagesWithCaptions.map(img => img.caption).filter(caption => caption.trim());
      
      // Generate story
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.text,
          tone: formData.tone,
          imageCount: formData.images.length,
          captions: captions
        })
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedText(result.generatedText);
        
        
        // Show success message
        alert('Story generated successfully! You can now preview your storybook or save your project.');
      } else {
        alert('Error generating story: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };


  const handleSave = () => {
    if (!storybookName.trim()) {
      alert('Please enter a name for your storybook');
      return;
    }
    const captions = imagesWithCaptions.map(img => img.caption);
    // Save project with user images and text
    onSaveProject(formData, generatedText, captions, [], storybookName);
  };

  const clearForm = () => {
    // Revoke all preview URLs
    imagesWithCaptions.forEach(img => URL.revokeObjectURL(img.preview));
    
    setFormData({ text: '', images: [], textFiles: [], tone: 'sweet' });
    setImagesWithCaptions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {projectName ? `Edit: ${projectName}` : 'Create New Storybook'}
            </h1>
            <p className="text-lg text-gray-600">
              Document your pregnancy journey with photos and memories
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={!formData.text.trim() && formData.images.length === 0 && formData.textFiles.length === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              generatedText && !initialData?.id 
                ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {generatedText && !initialData?.id ? 'Save Generated Story' : 'Save Project'}
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Name */}
            <div>
              <label htmlFor="storybook-name" className="block text-lg font-semibold text-gray-700 mb-3">
                Storybook Name
              </label>
              <input
                id="storybook-name"
                type="text"
                value={storybookName}
                onChange={(e) => setStorybookName(e.target.value)}
                placeholder="Enter a name for your storybook..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
            </div>

            {/* Tone Selection */}
            <div>
              <label htmlFor="tone-select" className="block text-lg font-semibold text-gray-700 mb-3">
                Choose Your Story Tone
              </label>
              <select
                id="tone-select"
                value={formData.tone}
                onChange={handleToneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                style={{
                  WebkitTextFillColor: '#111827',
                  WebkitBoxShadow: '0 0 0 1000px white inset'
                }}
              >
                <option value="sweet">Sweet and Sentimental</option>
                <option value="humorous">Humorous and Honest</option>
                <option value="journalistic">Journalistic and Milestone-Focused</option>
                <option value="poetic">Poetic and Reflective</option>
              </select>
            </div>

            {/* Text Input Section */}
            <div>
              <label htmlFor="text-input" className="block text-lg font-semibold text-gray-700 mb-3">
                Your Memories & Notes
              </label>
              <textarea
                id="text-input"
                value={formData.text}
                onChange={handleTextChange}
                placeholder="Share your pregnancy journey moments, thoughts, and feelings..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors text-gray-900"
                style={{
                  WebkitTextFillColor: '#111827',
                  WebkitBoxShadow: '0 0 0 1000px white inset'
                }}
              />
            </div>

            {/* Text File Upload Section */}
            <div>
              <label htmlFor="text-file-input" className="block text-lg font-semibold text-gray-700 mb-3">
                Upload Text Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                <input
                  id="text-file-input"
                  type="file"
                  multiple
                  accept=".txt"
                  onChange={handleTextFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="text-file-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Upload .txt files</span>
                </label>
              </div>
              {formData.textFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Text Files ({formData.textFiles.length})</h4>
                  <div className="space-y-2">
                    {formData.textFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeTextFile(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload Section */}
            <div>
              <label htmlFor="image-input" className="block text-lg font-semibold text-gray-700 mb-3">
                Upload Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                <input
                  id="image-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-lg text-gray-600 mb-2">Click to upload images</span>
                  <span className="text-sm text-gray-400">PNG, JPG, GIF up to 10MB each</span>
                </label>
              </div>
            </div>


            {/* Loading indicator for stored images */}
            {isLoadingStoredImages && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-700">Loading your saved photos...</span>
                </div>
              </div>
            )}

            {/* Debug info when editing */}
            {initialData && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                <strong>Debug Info:</strong> Editing &quot;{initialData.name}&quot; | 
                Stored Images: {initialData.input?.images?.length || 0} | 
                Loaded Images: {imagesWithCaptions.length}
              </div>
            )}

            {/* Image Previews */}
            {imagesWithCaptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Your Journey Photos ({imagesWithCaptions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {imagesWithCaptions.map((imageObj, index) => (
                    <div 
                      key={index} 
                      className="relative group bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-move"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Drag to reorder
                      </div>
                      {imageObj.broken ? (
                        <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 mb-3 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Image unavailable</p>
                            <p className="text-xs text-gray-400">{imageObj.file.name}</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={imageObj.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 mb-3"
                          onError={(e) => {
                            console.error(`Image preview failed for ${imageObj.file.name}`);
                            // You could set a broken flag here if needed
                          }}
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Add a caption for this moment..."
                        value={imageObj.caption}
                        onChange={(e) => handleCaptionChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        style={{
                          WebkitTextFillColor: '#111827',
                          WebkitBoxShadow: '0 0 0 1000px white inset'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleGenerateStory}
                disabled={isGenerating || (!formData.text.trim() && formData.images.length === 0)}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Story...
                  </>
                ) : (
                  'Generate Story'
                )}
              </button>
              
              {(formData.text.trim() || formData.images.length > 0) && (
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 bg-white border-2 border-blue-500 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  {showPreview ? 'Hide Preview' : 'Preview Storybook'}
                </button>
              )}
              
              {showPreview && (
                <button
                  type="button"
                  onClick={exportToPDF}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Export PDF
                </button>
              )}
            </div>

            {/* Generated Story Display */}
            {generatedText && (
              <div className="mt-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">✨</span>
                  Your Generated Story
                </h3>
                <div className="prose prose-pink max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {generatedText}
                  </p>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Summary Section */}
        {(formData.text.trim() || formData.images.length > 0 || formData.textFiles.length > 0) && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Journey Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{formData.text.length}</div>
                <div className="text-sm text-gray-600">Characters</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{formData.images.length}</div>
                <div className="text-sm text-gray-600">Photos</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-700">{formData.textFiles.length}</div>
                <div className="text-sm text-gray-600">Text Files</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 capitalize">{formData.tone.replace('_', ' ')}</div>
                <div className="text-sm text-gray-600">Tone</div>
              </div>
            </div>
          </div>
        )}

        {/* Storybook Preview */}
        {showPreview && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Storybook Preview</h2>
              <button
                onClick={exportToPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
            
            <div id="storybook-preview" className="prose max-w-none">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {formData.tone === 'journalistic' ? 'Timeline: Your Journey to Us' : 'Our Pregnancy Journey'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {generateNarrative().intro}
                </p>
              </div>

              {formData.text.trim() && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Your Story</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{formData.text}</p>
                </div>
              )}

              {formData.textFiles.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Uploaded Memories</h4>
                  <div className="space-y-2">
                    {formData.textFiles.map((file, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        📄 {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagesWithCaptions.length > 0 && (
                <div className="space-y-8">
                  <h4 className="font-semibold text-gray-800 text-lg">Journey Moments</h4>
                  {imagesWithCaptions.map((imageObj, index) => (
                    <div key={index} className="flex flex-col items-center space-y-4">
                      <img
                        src={imageObj.preview}
                        alt={`Journey moment ${index + 1}`}
                        className="max-w-md w-full h-64 object-cover rounded-lg shadow-md"
                      />
                      {imageObj.caption && (
                        <div className="text-center max-w-md">
                          <p className="text-gray-700 italic">
                            {formData.tone === 'sweet' && "This precious moment "}
                            {formData.tone === 'humorous' && "Here's when "}
                            {formData.tone === 'journalistic' && `Milestone ${index + 1}: `}
                            {formData.tone === 'poetic' && "Like a gentle whisper, "}
                            {imageObj.caption}
                            {formData.tone === 'sweet' && " filled our hearts with joy."}
                            {formData.tone === 'humorous' && " - and yes, it was as amazing as it looks!"}
                            {formData.tone === 'poetic' && " painted our world with wonder."}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg text-center">
                <p className="text-gray-700 font-medium">
                  {formData.tone === 'sweet' && "With all our love, we can't wait to meet you. ❤️"}
                  {formData.tone === 'humorous' && "And that's how our amazing adventure began! 🎉"}
                  {formData.tone === 'journalistic' && "Journey documented with love and anticipation."}
                  {formData.tone === 'poetic' && "A story written in love, waiting to unfold. ✨"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
