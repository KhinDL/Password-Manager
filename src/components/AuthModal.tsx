import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Key, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { AuthEntry } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (auth: Omit<AuthEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<AuthEntry>) => void;
  editingAuth?: AuthEntry;
  loading?: boolean;
}

const authTypes = [
  { value: 'totp', label: 'TOTP (Google Authenticator)', icon: Shield },
  { value: 'backup_codes', label: 'Backup Codes', icon: Key },
  { value: 'recovery_key', label: 'Recovery Key', icon: Key },
  { value: 'security_questions', label: 'Security Questions', icon: Shield },
  { value: 'app_password', label: 'App Password', icon: Key },
];

const authCategories = [
  'Social Media',
  'Work',
  'Banking',
  'Entertainment',
  'Shopping',
  'Email',
  'Cloud Services',
  'Other'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingAuth,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'totp' as AuthEntry['type'],
    secret: '',
    issuer: '',
    account: '',
    codes: [''],
    questions: [{ question: '', answer: '' }],
    notes: '',
    category: 'Other',
    isFavorite: false,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens for new auth
  useEffect(() => {
    if (isOpen && !editingAuth) {
      setFormData({
        title: '',
        type: 'totp',
        secret: '',
        issuer: '',
        account: '',
        codes: [''],
        questions: [{ question: '', answer: '' }],
        notes: '',
        category: 'Other',
        isFavorite: false,
      });
      setShowSecret(false);
    }
  }, [isOpen, editingAuth]);

  useEffect(() => {
    if (editingAuth) {
      setFormData({
        title: editingAuth.title,
        type: editingAuth.type,
        secret: editingAuth.secret || '',
        issuer: editingAuth.issuer || '',
        account: editingAuth.account || '',
        codes: editingAuth.codes || [''],
        questions: editingAuth.questions || [{ question: '', answer: '' }],
        notes: editingAuth.notes || '',
        category: editingAuth.category,
        isFavorite: editingAuth.isFavorite || false,
      });
    }
  }, [editingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        codes: formData.type === 'backup_codes' ? formData.codes.filter(code => code.trim()) : undefined,
        questions: formData.type === 'security_questions' ? formData.questions.filter(q => q.question.trim() && q.answer.trim()) : undefined,
      };

      if (editingAuth && onUpdate) {
        await onUpdate(editingAuth.id, submitData);
      } else {
        await onSave(submitData);
      }
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCode = () => {
    setFormData(prev => ({
      ...prev,
      codes: [...prev.codes, '']
    }));
  };

  const removeCode = (index: number) => {
    setFormData(prev => ({
      ...prev,
      codes: prev.codes.filter((_, i) => i !== index)
    }));
  };

  const updateCode = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      codes: prev.codes.map((code, i) => i === index ? value : code)
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', answer: '' }]
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  if (!isOpen) return null;

  const selectedType = authTypes.find(t => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden border border-gray-700 flex flex-col">
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {editingAuth ? 'Edit Authentication' : 'Add Authentication'}
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
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="e.g., Google 2FA, GitHub Backup Codes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white"
                >
                  {authCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Authentication Type *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {authTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center space-x-3 ${
                        formData.type === type.value
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TOTP Fields */}
            {formData.type === 'totp' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Issuer
                    </label>
                    <input
                      type="text"
                      value={formData.issuer}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                      placeholder="e.g., Google, GitHub"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Account
                    </label>
                    <input
                      type="text"
                      value={formData.account}
                      onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                      placeholder="e.g., user@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Secret Key *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={formData.secret}
                      onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 font-mono"
                      placeholder="Enter TOTP secret key"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300"
                    >
                      {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Codes */}
            {formData.type === 'backup_codes' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Backup Codes *
                  </label>
                  <button
                    type="button"
                    onClick={addCode}
                    className="flex items-center space-x-1 px-3 py-1 text-xs text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Code</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.codes.map((code, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => updateCode(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 font-mono text-sm"
                        placeholder="Enter backup code"
                      />
                      {formData.codes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCode(index)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery Key */}
            {formData.type === 'recovery_key' && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Recovery Key *
                </label>
                <div className="relative">
                  <textarea
                    value={formData.secret}
                    onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 font-mono"
                    rows={4}
                    placeholder="Enter recovery key or phrase"
                    required
                  />
                </div>
              </div>
            )}

            {/* Security Questions */}
            {formData.type === 'security_questions' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Security Questions *
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center space-x-1 px-3 py-1 text-xs text-green-400 hover:text-green-300 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-colors font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Question</span>
                  </button>
                </div>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {formData.questions.map((qa, index) => (
                    <div key={index} className="p-4 border border-gray-600 rounded-2xl bg-gray-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Question {index + 1}</span>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={qa.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 text-sm"
                          placeholder="Security question"
                        />
                        <input
                          type="text"
                          value={qa.answer}
                          onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 text-sm"
                          placeholder="Answer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* App Password */}
            {formData.type === 'app_password' && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  App Password *
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={formData.secret}
                    onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 font-mono"
                    placeholder="Enter app-specific password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300"
                  >
                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
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
                className="rounded border-gray-600 text-green-500 focus:ring-green-500 bg-gray-900"
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
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : editingAuth ? 'Update' : 'Save'} Authentication
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};