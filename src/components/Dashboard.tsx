import React, { useState, useMemo } from 'react';
import { Search, Plus, LogOut, Filter, Download, Upload, Star } from 'lucide-react';
import { PasswordCard } from './PasswordCard';
import { PasswordModal } from './PasswordModal';
import { PasswordEntry, Category } from '../types';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center transform rotate-12">
                <span className="text-white font-bold text-sm">VG</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">VaultGuard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportPasswords}
                disabled={loading}
                className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
                title="Export passwords"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="p-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-300">Total Passwords</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">{stats.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-300">Favorites</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.favorites}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-300">Weak Passwords</p>
                <p className="text-3xl font-bold text-red-400">{stats.weak}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">!</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-300">Strong Passwords</p>
                <p className="text-3xl font-bold text-green-400">{stats.strong}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm transition-all duration-200 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-2xl'
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600 rounded-2xl backdrop-blur-sm'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="text-sm">Favorites</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>{loading ? 'Loading...' : 'Add Password'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Password Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">Loading your passwords...</h3>
            <p className="text-gray-400 animate-pulse">Syncing with cloud storage...</p>
          </div>
        ) : filteredPasswords.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3">No passwords found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'all' || showFavoritesOnly
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first password."}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Password</span>
            </button>
          </div>
        ) : (
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
        )}
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