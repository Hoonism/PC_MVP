'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import AuthModal from '../components/AuthModal';
import Dashboard from '../components/Dashboard';
import CreateStorybook from '../components/CreateStorybook';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { firestoreService, StorybookData } from '../lib/firestore';
import { getBackgroundClass } from '../lib/theme';

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
}

function AppContent() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [projects, setProjects] = useState<StorybookData[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'create'>('dashboard');
  const [editingProject, setEditingProject] = useState<StorybookData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load projects from Firestore
  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userStorybooks = await firestoreService.getUserStorybooks(user.uid);
      console.log('Loaded storybooks:', userStorybooks); // Debug log
      setProjects(userStorybooks);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load projects when user changes
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setProjects([]);
    setCurrentProjectId(null);
    setCurrentView('dashboard');
    setEditingProject(null);
  };

  const saveProject = async (
    projectData: FormData,
    generatedText: string = '',
    captions: string[] = [],
    generatedImageUrls: string[] = [],
    projectName?: string
  ) => {
    if (!projectName || !user) return;

    console.log('saveProject called with generatedImageUrls:', generatedImageUrls);
    setLoading(true);
    try {
      if (editingProject && editingProject.id) {
        // Update existing project
        await firestoreService.updateStorybook(
          editingProject.id,
          user.uid,
          projectName,
          {
            text: projectData.text,
            tone: projectData.tone,
            images: projectData.images,
            textFiles: projectData.textFiles,
            captions
          },
          generatedText,
          generatedImageUrls
        );
      } else {
        // Create new project
        await firestoreService.saveStorybook(
          user.uid,
          projectName,
          {
            text: projectData.text,
            tone: projectData.tone,
            images: projectData.images,
            textFiles: projectData.textFiles,
            captions
          },
          generatedText,
          generatedImageUrls
        );
      }
      
      // Refresh projects list and navigate to dashboard
      await loadProjects();
      setEditingProject(null);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    } finally {
      setLoading(false);
    }
    
    // Force a small delay to ensure state updates
    setTimeout(() => {
      console.log('Save completed, projects state:', projects); // Debug log
    }, 100);
  };

  const editProject = (project: StorybookData) => {
    setEditingProject(project);
    setCurrentView('create');
  };

  const deleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setLoading(true);
      try {
        await firestoreService.deleteStorybook(projectId);
        await loadProjects(); // Refresh the list
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      } finally {
        setLoading(false);
      }
      if (editingProject?.id === projectId) {
        setEditingProject(null);
        setCurrentView('dashboard');
      }
    }
  };

  const createNewStorybook = () => {
    setEditingProject(null);
    setCurrentView('create');
  };

  const backToDashboard = () => {
    setEditingProject(null);
    setCurrentView('dashboard');
  };

  // Authentication check
  if (!user) {
    return (
      <div className={`min-h-screen ${getBackgroundClass(theme)}`}>
        <AuthModal isOpen={true} onClose={() => {}} />
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        projects={projects}
        onCreateNew={createNewStorybook}
        onEditProject={editProject}
        onDeleteProject={deleteProject}
        user={{ 
          name: user.displayName || user.email?.split('@')[0] || 'User', 
          email: user.email || '' 
        }}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <CreateStorybook
        onBackToDashboard={backToDashboard}
        onSaveProject={saveProject}
        initialData={editingProject || undefined}
        projectName={editingProject?.name}
      />
    );
  }

  return null;
}

export default function Home() {
  return <AppContent />;
}
