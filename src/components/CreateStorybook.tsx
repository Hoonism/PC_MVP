'use client';

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getButtonClass, getInputClass, getCardClass, getHeadingClass, getBodyClass, getBackgroundClass, getCardBackgroundClass } from '../lib/theme';
import { useTheme } from '../contexts/ThemeContext';

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
  existingUrl?: string; // Track if this is an existing image from Firestore
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
  const { theme } = useTheme();
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
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [showStoryPreview, setShowStoryPreview] = useState(false);
  const [storyParagraphs, setStoryParagraphs] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [storybookName, setStorybookName] = useState<string>(projectName || '');
  const [isLoadingStoredImages, setIsLoadingStoredImages] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Load auto-saved draft on mount (only for new storybooks)
  useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem('storybook_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          const shouldRestore = window.confirm(
            `Found an auto-saved draft from ${new Date(parsed.timestamp).toLocaleString()}. Would you like to restore it?`
          );
          
          if (shouldRestore) {
            setFormData({
              text: parsed.text || '',
              images: [],
              textFiles: [],
              tone: parsed.tone || 'sweet'
            });
            setStorybookName(parsed.storybookName || '');
            setGeneratedText(parsed.generatedText || '');
            // Note: Images can't be restored from localStorage, only metadata
          } else {
            localStorage.removeItem('storybook_draft');
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          localStorage.removeItem('storybook_draft');
        }
      }
    }
  }, [initialData]);

  // Initialize data when editing existing storybook
  useEffect(() => {
    if (initialData) {
      setGeneratedText(initialData.output?.generatedText || '');
      
      
      // Initialize images with captions from stored data
      if (initialData.input?.images && initialData.input.images.length > 0) {
        console.log('Loading user images from stored data:', initialData.input.images.length, 'images');
        setIsLoadingStoredImages(true);
        
        const loadImage = async (imageData: any, index: number) => {
          try {
            console.log(`=== LOADING IMAGE ${index + 1} ===`);
            console.log(`Name:`, imageData.name);
            console.log(`Stored URL:`, imageData.url);
            console.log(`URL includes %2F:`, imageData.url.includes('%2F'));
            
            // Use proxy endpoint to avoid CORS issues
            // Encode the URL so the server can safely preserve %2F
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageData.url)}`;
            console.log(`Proxy URL:`, proxyUrl);
            const response = await fetch(proxyUrl);

            if (response.ok) {
              const blob = await response.blob();
              const file = new File([blob], imageData.name, { type: blob.type });
              const previewUrl = URL.createObjectURL(blob);

              console.log(`✓ Image ${index + 1} loaded successfully via proxy`);
              return {
                file,
                preview: previewUrl,
                caption: imageData.caption,
                existingUrl: imageData.url
              };
            }

            // Fallback: try direct fetch without proxy
            console.warn(`Proxy failed for image ${index + 1} with status ${response.status}. Trying direct URL...`);
            const directResp = await fetch(imageData.url, {
              // Let browser handle CORS; if blocked, this may fail
              headers: { Accept: 'image/*,*/*;q=0.8' },
            });

            if (directResp.ok) {
              const blob = await directResp.blob();
              const file = new File([blob], imageData.name, { type: blob.type });
              const previewUrl = URL.createObjectURL(blob);

              console.log(`✓ Image ${index + 1} loaded successfully via direct URL`);
              return {
                file,
                preview: previewUrl,
                caption: imageData.caption,
                existingUrl: imageData.url
              };
            }

            console.error(`Failed to load image ${index + 1}: proxy ${response.status}, direct ${directResp.status}`);
            // Return placeholder without throwing to avoid noisy stack traces
            return {
              file: new File([new Blob()], imageData.name, { type: 'image/jpeg' }),
              preview: '',
              caption: imageData.caption,
              broken: true,
              existingUrl: imageData.url
            } as ImageWithCaption;
          } catch (error) {
            console.error(`Error loading image ${index + 1}:`, error);
            // Return placeholder for broken images
            return {
              file: new File([new Blob()], imageData.name, { type: 'image/jpeg' }),
              preview: '',
              caption: imageData.caption,
              broken: true,
              existingUrl: imageData.url
            };
          }
        };
        
        const imagePromises = initialData.input.images.map(loadImage);

        Promise.all(imagePromises).then(images => {
          const allImages = images.filter(img => img !== null) as ImageWithCaption[];
          const loadedCount = allImages.filter(img => !img.broken).length;
          const brokenCount = allImages.filter(img => img.broken).length;
          console.log(`Loaded ${loadedCount} of ${initialData.input.images.length} images successfully (${brokenCount} failed)`);
          setImagesWithCaptions(allImages);
          setFormData(prev => ({
            ...prev,
            images: allImages.map(img => img.file)
          }));
        }).catch(error => {
          console.error('Error processing image promises:', error);
        }).finally(() => {
          setIsLoadingStoredImages(false);
        });
      }
    }
  }, [initialData]);

  // Auto-save draft to localStorage every 30 seconds
  useEffect(() => {
    // Don't auto-save when editing existing storybook (only for new ones)
    if (initialData) return;
    
    const saveInterval = setInterval(() => {
      // Only save if there's content
      if (formData.text.trim() || storybookName.trim() || generatedText) {
        const draft = {
          text: formData.text,
          tone: formData.tone,
          storybookName,
          generatedText,
          timestamp: new Date().toISOString(),
          imageCount: imagesWithCaptions.length
        };
        
        localStorage.setItem('storybook_draft', JSON.stringify(draft));
        setLastAutoSave(new Date());
        console.log('Auto-saved draft at', new Date().toLocaleTimeString());
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [formData.text, formData.tone, storybookName, generatedText, imagesWithCaptions.length, initialData]);

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

  const generateStoryPDF = async () => {
    console.log('=== Starting PDF Generation ===');
    console.log('Generated text length:', generatedText?.length);
    console.log('Images count:', imagesWithCaptions.length);
    console.log('Story paragraphs count:', storyParagraphs.length);
    
    if (!generatedText || imagesWithCaptions.length === 0) {
      alert('Please generate a story and add images first.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      let paragraphs = storyParagraphs;
      
      // Only split if we don't have cached paragraphs or image count changed
      if (storyParagraphs.length !== imagesWithCaptions.length) {
        console.log('Splitting story into paragraphs...');
        const response = await fetch('/api/split-story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            generatedText,
            imageCount: imagesWithCaptions.length
          })
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error);
        }

        paragraphs = result.paragraphs;
        setStoryParagraphs(paragraphs);
      } else {
        console.log('Using cached story paragraphs for PDF generation');
      }

      // Create PDF with text overlaid on images
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      console.log(`Processing ${Math.min(paragraphs.length, imagesWithCaptions.length)} pages for PDF`);
      
      for (let i = 0; i < Math.min(paragraphs.length, imagesWithCaptions.length); i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const imageObj = imagesWithCaptions[i];
        const paragraph = paragraphs[i];
        // Prefer existingUrl (Firebase URL) for AI-generated images, but route via proxy to satisfy CORS
        const imageSrc = imageObj.existingUrl
          ? `/api/proxy-image?url=${encodeURIComponent(imageObj.existingUrl)}`
          : imageObj.preview;
        
        console.log(`Page ${i + 1}: Using ${imageObj.existingUrl ? 'existingUrl' : 'preview'} - ${imageSrc?.substring(0, 50)}...`);

        // Convert image to canvas to get it as base64
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(`Page ${i + 1}: Image loaded successfully`);
            try {
              // Create a canvas to draw the image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Set canvas size to maintain aspect ratio within page bounds
              const imgAspectRatio = img.width / img.height;
              let canvasWidth = contentWidth * 2.83; // Convert mm to pixels (rough conversion)
              let canvasHeight = canvasWidth / imgAspectRatio;
              
              // If height is too large, scale down
              if (canvasHeight > (contentHeight * 0.7) * 2.83) {
                canvasHeight = (contentHeight * 0.7) * 2.83;
                canvasWidth = canvasHeight * imgAspectRatio;
              }
              
              canvas.width = canvasWidth;
              canvas.height = canvasHeight;
              
              // Draw image
              ctx!.drawImage(img, 0, 0, canvasWidth, canvasHeight);
              
              // Add the image to PDF (full page)
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              const imgWidthMM = canvasWidth / 2.83; // Convert back to mm
              const imgHeightMM = canvasHeight / 2.83;
              
              // Center the image horizontally
              const imgX = (pageWidth - imgWidthMM) / 2;
              const imgY = margin;
              
              pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidthMM, imgHeightMM);
              
              // Now add text overlay with highlighter effect
              pdf.setFontSize(16);
              pdf.setFont('helvetica', 'bold');
              
              // Calculate text position (bottom third of image)
              const textY = imgY + imgHeightMM * 0.7;
              const textWidth = imgWidthMM - 40; // More margin for better readability
              const textX = imgX + 20;
              
              // Split text into lines that fit the width
              const lines = pdf.splitTextToSize(paragraph, textWidth);
              const lineHeight = 7; // Line spacing
              const totalTextHeight = lines.length * lineHeight;
              const padding = 8;
              
              // Draw highlighter effect background for text
              // Using a bright semi-opaque yellow highlighter for readability
              const bgY = textY - padding;
              const bgHeight = totalTextHeight + (padding * 2);
              
              // Set opacity for the highlighter background
              (pdf as any).setGState((pdf as any).GState({ opacity: 0.85 }));
              pdf.setFillColor(255, 255, 102); // Bright yellow highlighter
              pdf.roundedRect(textX - padding, bgY, textWidth + (padding * 2), bgHeight, 3, 3, 'F');
              
              // Reset opacity for text
              (pdf as any).setGState((pdf as any).GState({ opacity: 1 }));
              pdf.setTextColor(20, 20, 20); // Dark gray/black text for contrast
              
              // Add the text with proper spacing
              let currentY = textY + 5;
              lines.forEach((line: string) => {
                pdf.text(line, textX, currentY);
                currentY += lineHeight;
              });
              
              resolve(null);
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = (error) => {
            console.error(`Page ${i + 1}: Failed to load image`, error);
            console.error('Image source:', imageSrc);
            console.error('Image object:', imageObj);
            reject(new Error(`Failed to load image for page ${i + 1}`));
          };
          img.src = imageSrc || '';
        });
      }

      console.log('PDF generation complete! Saving file...');
      // Save the PDF
      pdf.save(`storybook-${storybookName || 'journey'}-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating story PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreviewStory = async () => {
    if (!generatedText || imagesWithCaptions.length === 0) {
      alert('Please generate a story and add images first.');
      return;
    }

    try {
      // Use cached paragraphs if available and matches image count
      if (storyParagraphs.length > 0 && storyParagraphs.length === imagesWithCaptions.length) {
        console.log('Using cached story paragraphs for preview');
        setShowStoryPreview(true);
        return;
      }

      // If we don't have paragraphs, split the story naturally
      if (storyParagraphs.length === 0) {
        const naturalParagraphs = generatedText.split('\n\n').filter((p: string) => p.trim().length > 0);
        if (naturalParagraphs.length > 0) {
          setStoryParagraphs(naturalParagraphs);
          setShowStoryPreview(true);
          return;
        }
      }

      // Fallback: Split the story into paragraphs matching image count
      const response = await fetch('/api/split-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generatedText,
          imageCount: imagesWithCaptions.length
        })
      });

      const result = await response.json();
      if (result.success) {
        setStoryParagraphs(result.paragraphs);
        setShowStoryPreview(true);
      } else {
        alert('Error preparing story preview: ' + result.error);
      }
    } catch (error) {
      console.error('Error preparing story preview:', error);
      alert('Error preparing story preview. Please try again.');
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
    setGenerationProgress('Preparing your story...');

    try {
      const captions = imagesWithCaptions.map(img => img.caption).filter(caption => caption.trim());
      
      setGenerationProgress('Crafting your narrative...');
      
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
        const storyText = result.generatedText;
        setGeneratedText(storyText);
        
        // Clear cached paragraphs since story has changed
        setStoryParagraphs([]);
        
        // Automatically generate images for the story
        setGenerationProgress('Analyzing story structure...');
        
        // Split story into natural paragraphs (no limit)
        const paragraphs = storyText.split('\n\n').filter((p: string) => p.trim().length > 0);
        setStoryParagraphs(paragraphs);
        
        setGenerationProgress(`Generating ${paragraphs.length} AI images for your story...`);
        
        // Generate images for each paragraph
        const imagePromises = paragraphs.map(async (paragraph: string, index: number) => {
          try {
            // Create image prompt from paragraph
            const imagePrompt = `Pregnancy journey: ${paragraph.substring(0, 200)}... Beautiful, photorealistic, heartwarming scene`;
            
            setGenerationProgress(`Generating image ${index + 1} of ${paragraphs.length}...`);
            
            const imageResponse = await fetch('/api/generate-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: imagePrompt,
                style: 'realistic',
                aspectRatio: '16:9',
                numImages: 1
              })
            });
            
            const imageResult = await imageResponse.json();
            
            if (imageResult.success && imageResult.imageUrls && imageResult.imageUrls[0]) {
              return imageResult.imageUrls[0];
            }
            return null;
          } catch (error) {
            console.error(`Error generating image ${index + 1}:`, error);
            return null;
          }
        });
        
        const generatedImageUrls = await Promise.all(imagePromises);
        const validImageUrls = generatedImageUrls.filter((url: string | null) => url !== null) as string[];
        
        setGenerationProgress('Adding images to your storybook...');
        
        // Add all generated images to the storybook
        for (const imageUrl of validImageUrls) {
          try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const fileName = `ai-story-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            // For AI images, we don't need a blob URL since we have the stable existingUrl
            // Only create preview for backward compatibility
            const preview = imageUrl; // Use the stable URL directly
            
            const newImage: ImageWithCaption = {
              file,
              preview,
              caption: '',
              existingUrl: imageUrl
            };
            
            setImagesWithCaptions(prev => [...prev, newImage]);
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, file]
            }));
          } catch (error) {
            console.error('Error adding image:', error);
          }
        }
        
        setGenerationProgress('');
        alert(`Story and ${validImageUrls.length} AI images generated successfully! You can add captions to the images and preview your storybook.`);
      } else {
        alert('Error generating story: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };


  // Manual AI image generation functions removed - now automatic with story generation

  const handleSave = () => {
    if (!storybookName.trim()) {
      alert('Please enter a name for your storybook');
      return;
    }
    const captions = imagesWithCaptions.map(img => img.caption);
    
    // Separate existing URLs from newly generated AI images
    const existingImageUrls: string[] = [];
    const generatedImageUrls: string[] = [];
    
    imagesWithCaptions.forEach((img, index) => {
      if (img.existingUrl) {
        // Check if this is from an existing saved project or newly AI-generated
        const isAlreadySaved = initialData && 
                               initialData.input?.images?.[index]?.url === img.existingUrl;
        
        if (isAlreadySaved) {
          // This image was already saved before - use existingUrl to skip upload
          existingImageUrls.push(img.existingUrl);
        } else {
          // This is a newly AI-generated image - needs to be saved
          existingImageUrls.push('');
          generatedImageUrls.push(img.existingUrl);
        }
      } else {
        // New user-uploaded image - needs upload
        existingImageUrls.push('');
      }
    });
    
    // Create updated form data with existing URL info
    const saveData = {
      ...formData,
      existingImageUrls
    } as any;
    
    console.log('Saving:', {
      totalImages: imagesWithCaptions.length,
      existingToSkip: existingImageUrls.filter(u => u).length,
      aiGeneratedToSave: generatedImageUrls.length,
      newToUpload: existingImageUrls.filter(u => !u).length - generatedImageUrls.length
    });
    
    // Clear auto-save draft after successful save
    localStorage.removeItem('storybook_draft');
    setLastAutoSave(null);
    
    onSaveProject(saveData, generatedText, captions, generatedImageUrls, storybookName);
  };

  const clearForm = () => {
    // Revoke all preview URLs
    imagesWithCaptions.forEach(img => URL.revokeObjectURL(img.preview));
    
    setFormData({ text: '', images: [], textFiles: [], tone: 'sweet' });
    setImagesWithCaptions([]);
    
    // Clear auto-save draft
    localStorage.removeItem('storybook_draft');
    setLastAutoSave(null);
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass(theme)}`}>
      {/* Header - Minimalistic */}
      <div className={`${getCardBackgroundClass(theme)} border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={onBackToDashboard}
                className={getButtonClass('ghost', theme) + " flex items-center space-x-2"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <div>
                <h1 className={getHeadingClass('h1', theme)}>
                  {projectName ? projectName : 'New Storybook'}
                </h1>
                {lastAutoSave && !initialData && (
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
                    Auto-saved at {lastAutoSave.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!formData.text.trim() && formData.images.length === 0 && formData.textFiles.length === 0}
              className={getButtonClass('primary', theme) + " disabled:opacity-50 disabled:cursor-not-allowed"}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="storybook-name" className={`block ${getBodyClass('base', theme)} mb-2`}>
              Storybook Name
            </label>
            <input
              id="storybook-name"
              type="text"
              value={storybookName}
              onChange={(e) => setStorybookName(e.target.value)}
              placeholder="Enter a name for your storybook..."
              className={getInputClass('base', theme)}
              required
            />
          </div>

          {/* Tone Selection */}
          <div>
            <label htmlFor="tone-select" className={`block ${getBodyClass('base', theme)} mb-2`}>
              Story Tone
            </label>
            <select
              id="tone-select"
              value={formData.tone}
              onChange={handleToneChange}
              className={getInputClass('base', theme)}
            >
              <option value="sweet">Sweet and Sentimental</option>
              <option value="humorous">Humorous and Honest</option>
              <option value="journalistic">Journalistic and Milestone-Focused</option>
              <option value="poetic">Poetic and Reflective</option>
            </select>
          </div>

          {/* Text Input Section */}
          <div>
            <label htmlFor="text-input" className={`block ${getBodyClass('base', theme)} mb-2`}>
              Your Memories & Notes
            </label>
            <textarea
              id="text-input"
              value={formData.text}
              onChange={handleTextChange}
              placeholder="Share your pregnancy journey moments, thoughts, and feelings..."
              rows={6}
              className={getInputClass('textarea', theme)}
            />
            </div>

          {/* Image Upload Section - Simplified */}
          <div>
            <label htmlFor="image-input" className={`block ${getBodyClass('base', theme)} mb-2`}>
              Photos
            </label>
            <div className={`border-2 border-dashed ${theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'} rounded-lg p-8 text-center transition-colors`}>
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
                <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className={`${getBodyClass('base', theme)} mb-1`}>Click to upload photos</span>
                <span className={`${getBodyClass('small', theme)}`}>PNG, JPG, GIF up to 10MB each</span>
              </label>
            </div>
          </div>

          {/* AI Generation Info */}
          <div className={`p-4 ${theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-lg`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className={`${getBodyClass('small', theme)} text-blue-600 dark:text-blue-400`}>
                <strong>AI-Powered:</strong> When you click "Generate Story" below, AI will automatically create your story text and beautiful pregnancy journey images for each paragraph!
              </p>
            </div>
          </div>


          {/* Loading indicator for stored images */}
          {isLoadingStoredImages && (
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'} border rounded-lg`}>
              <div className="flex items-center">
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${theme === 'dark' ? 'border-slate-400' : 'border-slate-600'} mr-2`}></div>
                <span className={`${getBodyClass('small', theme)}`}>Loading your saved photos...</span>
              </div>
            </div>
          )}

          {/* Debug info when editing - Hidden in production */}
          {initialData && process.env.NODE_ENV === 'development' && (
            <div className={`p-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} border rounded-lg text-xs`}>
              <strong>Debug:</strong> Editing "{initialData.name}" | 
              Stored: {initialData.input?.images?.length || 0} | 
              Loaded: {imagesWithCaptions.length}
            </div>
          )}

          {/* Image Previews */}
          {imagesWithCaptions.length > 0 && (
            <div>
              <h3 className={`${getHeadingClass('h3', theme)} mb-4`}>
                Photos ({imagesWithCaptions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagesWithCaptions.map((imageObj, index) => (
                  <div 
                    key={index} 
                    className={`relative group ${getCardBackgroundClass(theme)} p-4 rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} cursor-move`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className={`absolute top-2 left-2 ${theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-500 text-white'} text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity`}>
                      Drag to reorder
                    </div>
                    {imageObj.broken ? (
                      <div className={`w-full h-40 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} rounded-lg border mb-3 flex items-center justify-center`}>
                        <div className={`text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className={getBodyClass('small', theme)}>Image unavailable</p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{imageObj.file.name}</p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={imageObj.existingUrl || imageObj.preview}
                        alt={`Preview ${index + 1}`}
                        className={`w-full h-40 object-cover rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mb-3`}
                        onError={(e) => {
                          console.error(`Image preview failed for ${imageObj.file?.name || 'AI image'}`);
                        }}
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Add a caption for this moment..."
                      value={imageObj.caption}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className={getInputClass('small', theme)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={`absolute top-2 right-2 ${theme === 'dark' ? 'bg-red-500 hover:bg-red-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors opacity-0 group-hover:opacity-100`}
                    >
                      ×
                    </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Action Buttons - Simplified */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleGenerateStory}
              disabled={isGenerating || (!formData.text.trim() && formData.images.length === 0)}
              className={`${getButtonClass('primary', theme)} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {generationProgress || 'Generating...'}
                </>
              ) : (
                'Generate Story'
              )}
            </button>
            
            {(formData.text.trim() || formData.images.length > 0) && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`${getButtonClass('secondary', theme)} flex-1`}
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
            )}
          </div>

          {/* Story PDF Actions - Only show when story is generated */}
          {generatedText && imagesWithCaptions.length > 0 && (
            <div className={`p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'} border rounded-lg`}>
              <h4 className={`${getHeadingClass('h4', theme)} mb-2 flex items-center`}>
                <span className="mr-2">📖</span>
                Story PDF
              </h4>
              <p className={`${getBodyClass('small', theme)} mb-4`}>
                Create a PDF with story text overlaid on images with a highlighter effect for easy reading.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePreviewStory}
                  className={`${getButtonClass('secondary', theme)} flex items-center justify-center flex-1`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Story PDF
                </button>
                <button
                  type="button"
                  onClick={generateStoryPDF}
                  disabled={isGeneratingPDF}
                  className={`${getButtonClass('primary', theme)} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-1`}
                >
                  {isGeneratingPDF ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Story PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

          {/* Traditional PDF Export */}
          {showPreview && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={exportToPDF}
                className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Traditional PDF
              </button>
            </div>
          )}
        </form>

        {/* Generated Story Display - Outside form */}
        {generatedText && (
          <div className={`mt-6 p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-600' : 'bg-slate-50 border-slate-200'} border rounded-lg`}>
            <h3 className={`${getHeadingClass('h3', theme)} mb-3 flex items-center`}>
              <span className="mr-2">✨</span>
              Your Generated Story
            </h3>
            <div className="prose prose-slate max-w-none">
              <p className={`${getBodyClass('base', theme)} leading-relaxed whitespace-pre-wrap`}>
                {generatedText}
              </p>
            </div>
          </div>
        )}


        {/* Storybook Preview */}
        {showPreview && (
          <div className={`mt-6 ${getCardClass('elevated', theme)} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={getHeadingClass('h2', theme)}>Preview</h2>
              <button
                onClick={exportToPDF}
                className={getButtonClass('secondary', theme)}
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
                        src={imageObj.existingUrl || imageObj.preview}
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

        {/* Story PDF Preview */}
        {showStoryPreview && storyParagraphs.length > 0 && (
          <div className={`mt-8 ${getCardClass('elevated', theme)} p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={getHeadingClass('h2', theme)}>Story PDF Preview</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStoryPreview(false)}
                  className={getButtonClass('secondary', theme)}
                >
                  Hide Preview
                </button>
                <button
                  onClick={generateStoryPDF}
                  disabled={isGeneratingPDF}
                  className={`${getButtonClass('primary', theme)} disabled:opacity-50`}
                >
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            </div>
            
            <div className="space-y-8">
              <p className={`${getBodyClass('small', theme)} mb-6`}>
                Preview of your story PDF - each page has one paragraph overlaid on an image with a yellow highlighter effect for readability.
              </p>
              
              {storyParagraphs.map((paragraph, index) => {
                const imageObj = imagesWithCaptions[index];
                if (!imageObj) {
                  console.warn(`No image for paragraph ${index + 1}`);
                  return null;
                }
                
                // Prefer existingUrl (Firebase URL) over blob preview for stability
                const imageSrc = imageObj.existingUrl || imageObj.preview;
                console.log(`Preview page ${index + 1}:`, { 
                  hasPreview: !!imageObj.preview, 
                  hasExistingUrl: !!imageObj.existingUrl,
                  src: imageSrc?.substring(0, 100) + '...'
                });
                
                return (
                  <div key={index} className={`border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden shadow-md`}>
                    <div className={`${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} px-4 py-2 text-sm font-medium`}>
                      Page {index + 1}
                    </div>
                    <div className="relative">
                      {!imageSrc || imageObj.broken ? (
                        <div className={`w-full h-96 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center`}>
                          <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Image unavailable</p>
                            <p className="text-xs">{imageObj.file?.name || 'AI Generated'}</p>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={imageSrc}
                          alt={`Story page ${index + 1}`}
                          className="w-full h-96 object-cover"
                          onError={(e) => {
                            console.error(`Image ${index + 1} failed to load:`, imageSrc, imageObj);
                            const target = e.currentTarget;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-96 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center">
                                  <div class="text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}">
                                    <p>Failed to load image</p>
                                    <p class="text-xs mt-2">Check console for details</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      )}
                      
                      {/* Text overlay preview with highlighter effect */}
                      <div className="absolute bottom-8 left-8 right-8 bg-yellow-300 bg-opacity-90 rounded-lg p-6 shadow-lg">
                        <p className="text-gray-900 text-base font-bold leading-relaxed">
                          {paragraph}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
