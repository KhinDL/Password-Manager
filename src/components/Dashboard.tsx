import React, { useState, useMemo } from 'react';
import { Search, Plus, LogOut, Filter, Download, Upload, Star, Grid, List, Eye, EyeOff, Copy, Edit2, Trash2, ExternalLink, Check } from 'lucide-react';
import { PasswordCard } from './PasswordCard';
import { PasswordModal } from './PasswordModal';
import { PasswordEntry, Category } from '../types';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import * as LucideIcons from 'lucide-react';

interface DashboardProps {
  passwords: PasswordEntry[];
  categories: Category[];
  loading?: boolean;
  onAddPassword: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePassword: (id: string, updates: Partial<PasswordEntry>) => void;
  onDeletePassword: (id: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  passwords,
  categories,
  loading = false,
  onAddPassword,
  onUpdatePassword,
  onDeletePassword,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const filteredPasswords = useMemo(() => {
    return passwords.filter(password => {
      const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           password.url?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || password.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || password.isFavorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [passwords, searchTerm, selectedCategory, showFavoritesOnly]);

  const handleEditPassword = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPassword(undefined);
  };

  const handleToggleFavorite = (id: string) => {
    const password = passwords.find(p => p.id === id);
    if (password) {
      onUpdatePassword(id, { isFavorite: !password.isFavorite });
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const exportPasswords = () => {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'passwords-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = useMemo(() => {
    const total = passwords.length;
    const favorites = passwords.filter(p => p.isFavorite).length;
    const weak = passwords.filter(p => p.password.length < 8).length;
    const strong = passwords.filter(p => p.password.length >= 12 && /[A-Z]/.test(p.password) && /[a-z]/.test(p.password) && /\d/.test(p.password) && /[!@#$%^&*(),.?":{}|<>]/.test(p.password)).length;
    
    return { total, favorites, weak, strong };
  }, [passwords]);

  const renderPasswordRow = (password: PasswordEntry) => {
    const category = categories.find(c => c.id === password.category) || categories[0];
    const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;
    const isPasswordVisible = showPasswords[password.id];

    return (
      <tr 
        key={password.id}
        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
          selectedPassword?.id === password.id ? 'bg-blue-50' : ''
        }`}
        onClick={() => setSelectedPassword(password)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: category.color }}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{password.title}</span>
                {password.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              <span className="text-sm text-gray-500">{category.name}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-900 font-mono text-sm">
          {password.username}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-gray-900">
              {isPasswordVisible ? password.password : '••••••••'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePasswordVisibility(password.id);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(password.password, `password-${password.id}`);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copiedField === `password-${password.id}` ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </td>
        <td className="px-6 py-4">
          <PasswordStrengthIndicator password={password.password} />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(password.id);
              }}
              className={`p-1 rounded transition-colors ${
                password.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className={`w-4 h-4 ${password.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditPassword(password);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePassword(password.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VG</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">VaultGuard</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                selectedCategory === 'all'
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">{stats.total}</span>
              </div>
              <span>All Items</span>
            </button>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                showFavoritesOnly
                  ? 'bg-yellow-100 text-yellow-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
              <span>Favorites</span>
              <span className="ml-auto text-sm text-gray-500">{stats.favorites}</span>
            </button>

            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Categories</h3>
            </div>

            {categories.map(category => {
              const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;
              const count = passwords.filter(p => p.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <IconComponent className="w-3 h-3" />
                  </div>
                  <span>{category.name}</span>
                  <span className="ml-auto text-sm text-gray-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={exportPasswords}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export passwords"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Password</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Password List */}
          <div className="flex-1 bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading passwords...</p>
                </div>
              </div>
            ) : filteredPasswords.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No passwords found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedCategory !== 'all' || showFavoritesOnly
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by adding your first password."}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Password</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strength
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPasswords.map(renderPasswordRow)}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPasswords.map((password) => {
                    const category = categories.find(c => c.id === password.category) || categories[0];
                    return (
                      <PasswordCard
                        key={password.id}
                        password={password}
                        category={category}
                        onEdit={handleEditPassword}
                        onDelete={onDeletePassword}
                        onToggleFavorite={handleToggleFavorite}
                        loading={loading}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Details Panel */}
          {selectedPassword && viewMode === 'list' && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Password Details</h3>
                  <button
                    onClick={() => setSelectedPassword(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <p className="text-gray-900">{selectedPassword.title}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900 font-mono">{selectedPassword.username}</p>
                      <button
                        onClick={() => copyToClipboard(selectedPassword.username, 'detail-username')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'detail-username' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900 font-mono">
                        {showPasswords[selectedPassword.id] ? selectedPassword.password : '••••••••'}
                      </p>
                      <button
                        onClick={() => togglePasswordVisibility(selectedPassword.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[selectedPassword.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(selectedPassword.password, 'detail-password')}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {copiedField === 'detail-password' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Strength</label>
                    <PasswordStrengthIndicator password={selectedPassword.password} />
                  </div>

                  {selectedPassword.url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <a
                        href={selectedPassword.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                      >
                        <span>{selectedPassword.url}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {selectedPassword.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900 text-sm bg-white p-3 rounded border">{selectedPassword.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditPassword(selectedPassword)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(selectedPassword.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        selectedPassword.isFavorite
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${selectedPassword.isFavorite ? 'fill-current' : ''}`} />
                      <span>{selectedPassword.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={onAddPassword}
        onUpdate={onUpdatePassword}
        categories={categories}
        editingPassword={editingPassword}
        loading={loading}
      />
    </div>
  );
};