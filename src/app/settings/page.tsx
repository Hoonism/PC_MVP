'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/userProfileService'
import { Loader2, Save, Check } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      const userProfile = await getUserProfile(user.uid)
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        communicationStyle: profile.communicationStyle,
        financialSituation: profile.financialSituation,
        hasInsurance: profile.hasInsurance,
        insuranceProvider: profile.insuranceProvider,
        preferredPaymentTerms: profile.preferredPaymentTerms,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to access settings
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI Assistant Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Customize how the AI assistant helps you negotiate your medical bills
          </p>

          {profile && (
            <div className="space-y-8">
              {/* Communication Style */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Communication Style
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  How would you like the AI to communicate with you?
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'formal', label: 'Formal', desc: 'Professional business language' },
                    { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
                    { value: 'assertive', label: 'Assertive', desc: 'Direct and confident' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      style={{
                        borderColor:
                          profile.communicationStyle === option.value
                            ? '#3B82F6'
                            : 'transparent',
                        backgroundColor:
                          profile.communicationStyle === option.value
                            ? 'rgba(59, 130, 246, 0.05)'
                            : '',
                      }}
                    >
                      <input
                        type="radio"
                        name="communicationStyle"
                        value={option.value}
                        checked={profile.communicationStyle === option.value}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            communicationStyle: e.target.value as any,
                          })
                        }
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Financial Situation */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Financial Situation
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  This helps the AI recommend appropriate strategies
                </p>
                <div className="space-y-2">
                  {[
                    {
                      value: 'tight',
                      label: 'Limited Resources',
                      desc: 'Focus on hardship programs and payment plans',
                    },
                    {
                      value: 'moderate',
                      label: 'Moderate Flexibility',
                      desc: 'Balance between affordability and fair pricing',
                    },
                    {
                      value: 'flexible',
                      label: 'Financially Stable',
                      desc: 'Focus on fair pricing and billing accuracy',
                    },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      style={{
                        borderColor:
                          profile.financialSituation === option.value
                            ? '#3B82F6'
                            : 'transparent',
                        backgroundColor:
                          profile.financialSituation === option.value
                            ? 'rgba(59, 130, 246, 0.05)'
                            : '',
                      }}
                    >
                      <input
                        type="radio"
                        name="financialSituation"
                        value={option.value}
                        checked={profile.financialSituation === option.value}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            financialSituation: e.target.value as any,
                          })
                        }
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Insurance Information
                </label>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.hasInsurance || false}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          hasInsurance: e.target.checked,
                        })
                      }
                      className="mr-3"
                    />
                    <span className="text-gray-900 dark:text-gray-100">
                      I have health insurance
                    </span>
                  </label>

                  {profile.hasInsurance && (
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Insurance Provider (Optional)
                      </label>
                      <input
                        type="text"
                        value={profile.insuranceProvider || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            insuranceProvider: e.target.value,
                          })
                        }
                        placeholder="e.g., Blue Cross, Aetna, UnitedHealthcare"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Preferred Payment Terms (Optional)
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  e.g., "12-month payment plan", "Lump sum with discount"
                </p>
                <input
                  type="text"
                  value={profile.preferredPaymentTerms || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferredPaymentTerms: e.target.value,
                    })
                  }
                  placeholder="Enter your preferred payment terms"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Stats Display */}
              {profile.totalBillsNegotiated && profile.totalBillsNegotiated > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Your Negotiation Stats
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {profile.totalBillsNegotiated}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Bills Negotiated
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${profile.totalAmountSaved?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Saved
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(profile.averageReductionRate || 0)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Avg Reduction
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
