'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getButtonClass, getInputClass, getCardClass, getHeadingClass, getBodyClass, getBackgroundClass, getCardBackgroundClass } from '../lib/theme';
import { useTheme } from '../contexts/ThemeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { theme } = useTheme();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
      onClose();
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} flex items-center justify-center p-4 z-50`}>
      <div className={`${getCardClass('elevated', theme)} w-full max-w-sm p-6`}>
        <div className="text-center mb-6">
          <h1 className={getHeadingClass('h1', theme)}>JourneyBook</h1>
          <p className={`${getBodyClass('small', theme)} mt-1`}>Your pregnancy journey, beautifully documented</p>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={getHeadingClass('h2', theme)}>
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} text-xl`}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className={`${theme === 'dark' ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} px-3 py-2 border rounded-md text-sm`}>
              {error}
            </div>
          )}
          
          {!isLoginMode && (
            <div>
              <label htmlFor="name" className={`block ${getBodyClass('small', theme)} mb-1`}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLoginMode}
                className={getInputClass('base', theme)}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className={`block ${getBodyClass('small', theme)} mb-1`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={getInputClass('base', theme)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block ${getBodyClass('small', theme)} mb-1`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={getInputClass('base', theme)}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${getButtonClass('primary', theme)} w-full disabled:opacity-50`}
          >
            {isLoading ? 'Loading...' : (isLoginMode ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLoginMode(!isLoginMode)}
            className={`${theme === 'dark' ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'} font-medium text-sm`}
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
