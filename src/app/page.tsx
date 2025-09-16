'use client';

import { useState } from 'react';
import Image from "next/image";
import AuthModal from '../components/AuthModal';
import Dashboard from '../components/Dashboard';
import CreateStorybook from '../components/CreateStorybook';

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

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);
  const [projects, setProjects] = useState<{id: string; name: string; createdAt: string; data: FormData}[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'create'>('dashboard');
  const [editingProject, setEditingProject] = useState<{id: string; name: string; createdAt: string; data: FormData} | null>(null);

  const handleLogin = async (email: string, password: string) => {
    // Simulate login - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ name: email.split('@')[0], email });
    setIsAuthenticated(true);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    // Simulate registration - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ name, email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setProjects([]);
    setCurrentProjectId(null);
    setEditingProject(null);
    setCurrentView('dashboard');
  };

  const saveProject = (projectData: FormData) => {
    const projectName = prompt('Enter a name for your storybook:');
    if (!projectName) return;

    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.id === editingProject.id 
          ? { ...p, name: projectName, data: projectData }
          : p
      ));
      setEditingProject(null);
    } else {
      // Create new project
      const newProject = {
        id: Date.now().toString(),
        name: projectName,
        createdAt: new Date().toISOString(),
        data: projectData
      };
      setProjects(prev => [...prev, newProject]);
    }
    
    setCurrentView('dashboard');
    alert('Project saved successfully!');
  };

  const editProject = (project: {id: string; name: string; createdAt: string; data: FormData}) => {
    setEditingProject(project);
    setCurrentView('create');
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
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


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              JourneyBook
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Document your pregnancy journey with photos and memories
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                Get Started
              </button>
              <p className="text-sm text-gray-500">
                Create beautiful pregnancy storybooks with personalized narratives
              </p>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
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
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <CreateStorybook
        onBackToDashboard={backToDashboard}
        onSaveProject={saveProject}
        initialData={editingProject?.data}
        projectName={editingProject?.name}
      />
    );
  }

  return null;

}
