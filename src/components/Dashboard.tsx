'use client';

import { useState, useEffect } from 'react';
import { StorybookData } from '../lib/firestore';
import { useTheme } from '../contexts/ThemeContext';
import { getBackgroundClass, getCardBackgroundClass, getHeadingClass, getBodyClass, getButtonClass } from '../lib/theme';
import ThemeToggle from './ThemeToggle';

interface DashboardProps {
  projects: StorybookData[];
  onCreateNew: () => void;
  onEditProject: (project: StorybookData) => void;
  onDeleteProject: (projectId: string) => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function Dashboard({ 
  projects, 
  onCreateNew, 
  onEditProject, 
  onDeleteProject, 
  user, 
  onLogout 
}: DashboardProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  // Cache blob-based preview URLs per project to mirror successful rendering method
  const [projectImagePreviews, setProjectImagePreviews] = useState<Record<string, string[]>>({});
  
  console.log('Dashboard received projects:', projects); // Debug log

  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt as any);
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt as any);
      return bTime.getTime() - aTime.getTime();
    });

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Build blob previews for each project's images (limit to first 4 for card)
  useEffect(() => {
    let isActive = true;

    const buildPreviews = async () => {
      // Revoke old previews first to avoid leaks
      Object.values(projectImagePreviews).forEach(urls => urls.forEach(u => URL.revokeObjectURL(u)));
      const previewMap: Record<string, string[]> = {};

      for (const project of projects) {
        const id = project.id || project.name;
        const imgs = project.input?.images || [];
        const urls: string[] = [];
        for (const image of imgs.slice(0, 4)) {
          try {
            const resp = await fetch(image.url, { mode: 'cors' });
            const blob = await resp.blob();
            const objUrl = URL.createObjectURL(blob);
            urls.push(objUrl);
          } catch (e) {
            console.warn('Preview fetch failed, fallback to direct URL:', image.url, e);
            urls.push(image.url);
          }
        }
        previewMap[id] = urls;
      }

      if (isActive) setProjectImagePreviews(previewMap);
    };

    if (projects && projects.length > 0) {
      buildPreviews();
    } else {
      // clear previews
      Object.values(projectImagePreviews).forEach(urls => urls.forEach(u => URL.revokeObjectURL(u)));
      setProjectImagePreviews({});
    }

    return () => {
      isActive = false;
      Object.values(projectImagePreviews).forEach(urls => urls.forEach(u => URL.revokeObjectURL(u)));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const getToneColor = (tone: string) => {
    if (theme === 'dark') {
      const colors = {
        sweet: 'bg-pink-900 text-pink-200',
        humorous: 'bg-yellow-900 text-yellow-200',
        journalistic: 'bg-blue-900 text-blue-200',
        poetic: 'bg-purple-900 text-purple-200'
      };
      return colors[tone as keyof typeof colors] || 'bg-gray-700 text-gray-200';
    } else {
      const colors = {
        sweet: 'bg-pink-100 text-pink-800',
        humorous: 'bg-yellow-100 text-yellow-800',
        journalistic: 'bg-blue-100 text-blue-800',
        poetic: 'bg-purple-100 text-purple-800'
      };
      return colors[tone as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass(theme)}`}>
      {/* Header */}
      <div className={`${getCardBackgroundClass(theme)} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={getHeadingClass('h1', theme)}>JourneyBook</h1>
              <p className={`${getBodyClass('base', theme)} mt-1`}>Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={onCreateNew}
                className={getButtonClass('primary', theme) + " flex items-center space-x-2"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Storybook</span>
              </button>
              <button
                onClick={onLogout}
                className={`${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white px-4 py-3 rounded-lg font-medium transition-colors`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className={`${getCardBackgroundClass(theme)} rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-6 mb-8`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search storybooks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-full border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                className={`px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className={`${getCardBackgroundClass(theme)} rounded-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-12 max-w-md mx-auto`}>
              <svg className={`w-16 h-16 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className={getHeadingClass('h3', theme) + " mb-2"}>No Storybooks Yet</h3>
              <p className={`${getBodyClass('base', theme)} mb-6`}>Create your first pregnancy journey storybook to get started!</p>
              <button
                onClick={onCreateNew}
                className={getButtonClass('primary', theme)}
              >
                Create Your First Storybook
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className={`group ${getCardBackgroundClass(theme)} rounded-lg border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} transition-all overflow-hidden`}>
                {/* Image Preview Section */}
                {project.input?.images?.length > 0 && (
                  <div className="relative">
                    <div className="h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {(() => {
                        const id = project.id || project.name;
                        const previews = projectImagePreviews[id] || [];
                        if (project.input.images.length === 1) {
                          const src = previews[0] || project.input.images[0].url;
                          return (
                            <img
                              src={src}
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              alt={project.input.images[0].caption || 'Storybook image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (src !== project.input.images[0].url) {
                                  (e.currentTarget as HTMLImageElement).src = project.input.images[0].url;
                                }
                              }}
                            />
                          );
                        }
                        return (
                          <div className="grid grid-cols-2 gap-1 h-full">
                            {(project.input.images.slice(0, 4)).map((image, index) => {
                              const src = previews[index] || image.url;
                              return (
                                <div key={index} className="relative overflow-hidden">
                                  <img
                                    src={src}
                                    crossOrigin="anonymous"
                                    referrerPolicy="no-referrer"
                                    alt={image.caption || `Storybook image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      if (src !== image.url) {
                                        (e.currentTarget as HTMLImageElement).src = image.url;
                                      }
                                    }}
                                  />
                                  {index === 3 && project.input.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                      <span className="text-white font-medium text-sm">
                                        +{project.input.images.length - 4} more
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => onEditProject(project)}
                        className={`opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0`}
                      >
                        Add to Storybook
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`${getHeadingClass('h3', theme)} truncate flex-1 mr-2`}>
                      {project.name}
                    </h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEditProject(project)}
                        className={`p-2 ${theme === 'dark' ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'} transition-colors`}
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id || '')}
                        className={`p-2 ${theme === 'dark' ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`flex items-center text-sm ${getBodyClass('small', theme)}`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created {formatDate(project.createdAt)}
                    </div>
                    
                    {project.input?.images?.length > 0 && (
                      <div className={`flex items-center text-sm ${getBodyClass('small', theme)}`}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {project.input.images.length} photo{project.input.images.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    
                    {project.input?.tone && (
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToneColor(project.input.tone)}`}>
                          {project.input.tone.charAt(0).toUpperCase() + project.input.tone.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={`px-6 py-4 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t`}>
                  <button
                    onClick={() => onEditProject(project)}
                    className={`w-full ${getButtonClass('primary', theme)} py-2 px-4`}
                  >
                    Continue Editing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
