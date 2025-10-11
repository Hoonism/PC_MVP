'use client';

import { useState, useEffect } from 'react';
import { StorybookData } from '../lib/firestore';
import { useTheme } from '../contexts/ThemeContext';
import { getBackgroundClass, getCardBackgroundClass, getHeadingClass, getBodyClass, getButtonClass } from '../lib/theme';
import Sidebar from './Sidebar';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(image.url)}`;
          // Use proxy URL directly as <img> src. onError will fallback to direct URL if needed.
          urls.push(proxyUrl);
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
    <div className={`min-h-screen flex flex-col ${getBackgroundClass(theme)}`}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
      />

      {/* Header - Minimal */}
      <div className={`${getCardBackgroundClass(theme)} border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <h1 className={getHeadingClass('h3', theme)}>JourneyBook</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={onCreateNew}
                className={getButtonClass('primary', theme) + " flex items-center space-x-2"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New</span>
              </button>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto px-6 lg:px-8 py-8 w-full">
        {/* Search and Filter Bar - Simplified */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <svg className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search storybooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 pr-3 py-2.5 w-full border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm placeholder:${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
              className={`px-3 py-2.5 border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'} rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-sm`}
            >
              <option value="date">Recent</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-sm mx-auto">
              <svg className={`w-12 h-12 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className={getHeadingClass('h3', theme) + " mb-2"}>No storybooks yet</h3>
              <p className={`${getBodyClass('base', theme)} mb-6`}>Create your first pregnancy journey storybook to get started.</p>
              <button
                onClick={onCreateNew}
                className={getButtonClass('primary', theme)}
              >
                Create storybook
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div key={project.id} className={`group ${getCardBackgroundClass(theme)} rounded-lg border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-100 hover:border-gray-200'} transition-all duration-200 overflow-hidden cursor-pointer`} onClick={() => onEditProject(project)}>
                {/* Image Preview Section - Simplified */}
                {project.input?.images?.length > 0 && (
                  <div className="relative">
                    <div className={`h-40 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} overflow-hidden`}>
                      {(() => {
                        const id = project.id || project.name;
                        const previews = projectImagePreviews[id] || [];
                        if (project.input.images.length === 1) {
                          const baseUrl = project.input.images[0].url;
                          const src = previews[0] || `/api/proxy-image?url=${encodeURIComponent(baseUrl)}`;
                          const isSafeSrc = src.startsWith('blob:') || src.startsWith('/api/proxy-image');
                          return (
                            <img
                              src={src}
                              crossOrigin={isSafeSrc ? 'anonymous' : undefined}
                              referrerPolicy="no-referrer"
                              alt={project.input.images[0].caption || 'Storybook image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (src !== baseUrl) {
                                  (e.currentTarget as HTMLImageElement).src = baseUrl;
                                }
                              }}
                            />
                          );
                        }
                        return (
                          <div className="grid grid-cols-2 gap-0.5 h-full">
                            {(project.input.images.slice(0, 4)).map((image, index) => {
                              const src = previews[index] || `/api/proxy-image?url=${encodeURIComponent(image.url)}`;
                              const isSafeSrc = src.startsWith('blob:') || src.startsWith('/api/proxy-image');
                              return (
                                <div key={index} className="relative overflow-hidden">
                                  <img
                                    src={src}
                                    crossOrigin={isSafeSrc ? 'anonymous' : undefined}
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
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                      <span className="text-white font-medium text-xs">
                                        +{project.input.images.length - 4}
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
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`${getHeadingClass('h3', theme)} truncate flex-1`}>
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id || '');
                      }}
                      className={`p-1.5 ${theme === 'dark' ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors opacity-0 group-hover:opacity-100`}
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`${getBodyClass('small', theme)}`}>
                        {formatDate(project.createdAt)}
                      </span>
                      {project.input?.images?.length > 0 && (
                        <span className={`${getBodyClass('small', theme)}`}>
                          {project.input.images.length} photo{project.input.images.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    {project.input?.tone && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToneColor(project.input.tone)}`}>
                        {project.input.tone.charAt(0).toUpperCase() + project.input.tone.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Minimal */}
      <div className={`${getCardBackgroundClass(theme)} border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} mt-auto`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`${getBodyClass('small', theme)}`}>
              © {new Date().getFullYear()} JourneyBook. Preserving your precious moments.
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className={`${getBodyClass('small', theme)} ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-900'} transition-colors`}
              >
                Terms
              </a>
              <a
                href="#"
                className={`${getBodyClass('small', theme)} ${theme === 'dark' ? 'hover:text-gray-300' : 'hover:text-gray-900'} transition-colors`}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
