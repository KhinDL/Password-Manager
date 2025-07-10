import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit2, Trash2, ExternalLink, Check, Star } from 'lucide-react';
import { PasswordEntry, Category } from '../types';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import * as LucideIcons from 'lucide-react';

interface PasswordCardProps {
  password: PasswordEntry;
  category: Category;
  loading?: boolean;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  password,
  category,
  loading = false,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 overflow-hidden hover:scale-105 hover:border-gray-600">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: category.color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                {password.title}
                {password.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </h3>
              <p className="text-sm text-gray-400 font-medium">{category.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(password.id)}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                password.isFavorite
                  ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-500/20 rounded-xl'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl'
              }`}
            >
              <Star className={`w-4 h-4 ${password.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onEdit(password)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(password.id)}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-300">Username:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white font-mono bg-gray-700/50 px-2 py-1 rounded-lg">{password.username}</span>
              <button
                onClick={() => copyToClipboard(password.username, 'username')}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors hover:bg-gray-700 rounded"
              >
                {copiedField === 'username' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-300">Password:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white font-mono bg-gray-700/50 px-2 py-1 rounded-lg">
                {showPassword ? password.password : '••••••••'}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors hover:bg-gray-700 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(password.password, 'password')}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors hover:bg-gray-700 rounded"
              >
                {copiedField === 'password' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {password.url && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">Website:</span>
              <div className="flex items-center space-x-2">
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline font-mono truncate max-w-[200px] bg-gray-700/50 px-2 py-1 rounded-lg"
                >
                  {password.url}
                </a>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          {password.notes && (
            <div className="pt-3 border-t border-gray-700">
              <p className="text-sm text-gray-300 bg-gray-700/30 p-3 rounded-xl">{password.notes}</p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-700">
            <PasswordStrengthIndicator password={password.password} />
          </div>
        </div>
      </div>
    </div>
  );
};