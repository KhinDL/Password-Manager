import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { PasswordEntry, Category } from '../types';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { SmartPasswordGenerator } from './SmartPasswordGenerator';
import { SmartCategorySelector } from './SmartCategorySelector';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<PasswordEntry>) => void;
  categories: Category[];
  editingPassword?: PasswordEntry;
  loading?: boolean;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  categories,
  editingPassword,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: categories[0]?.id || '',
    isFavorite: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const generatePassword = () => {
    const length = 16;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setFormData(prev => ({ ...prev, password }));
  };

  // Reset form when modal opens for new password
  useEffect(() => {
    if (isOpen && !editingPassword) {
      setFormData({
        title: '',
        username: '',
        password: '',
        url: '',
        notes: '',
        category: categories[0]?.id || '',
        isFavorite: false,
      });
      setShowPassword(false);
    }
  }, [isOpen, editingPassword, categories]);

  useEffect(() => {
    if (editingPassword) {
      setFormData({
        title: editingPassword.title,
        username: editingPassword.username,
        password: editingPassword.password,
        url: editingPassword.url || '',
        notes: editingPassword.notes || '',
        category: editingPassword.category,
        isFavorite: editingPassword.isFavorite || false,
      });
    }
  }, [editingPassword, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      if (editingPassword && onUpdate) {
        await onUpdate(editingPassword.id, formData);
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden border border-gray-700 flex flex-col">
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {editingPassword ? 'Edit Password' : 'Add New Password'}
            </h2>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-2xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="e.g., Gmail, Facebook, Work Email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <SmartCategorySelector
                  categories={categories}
                  selectedCategory={formData.category}
                  onCategoryChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                  title={formData.title}
                  url={formData.url}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Username/Email *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="username or email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <label className="block text-sm font-semibold text-gray-300">
                    Password *
                  </label>
                  {formData.password && (
                    <div className="scale-50 origin-left -ml-2">
                      <PasswordStrengthIndicator password={formData.password} />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                    className="flex items-center space-x-1 px-3 py-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors font-medium"
                  >
                    <span>AI Generator</span>
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="flex items-center space-x-1 px-3 py-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl transition-colors font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Quick Generate</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* AI Password Generator */}
              {showAIGenerator && (
                <div className="mt-4">
                  <SmartPasswordGenerator
                    title={formData.title}
                    onPasswordGenerated={(password) => setFormData(prev => ({ ...prev, password }))}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                rows={3}
                placeholder="Additional notes or information"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorite"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-900"
              />
              <label htmlFor="favorite" className="text-sm text-gray-300 font-medium">
                Mark as favorite
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || loading}
                className="px-6 py-3 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-2xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : editingPassword ? 'Update' : 'Save'} Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};