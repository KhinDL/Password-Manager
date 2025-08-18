import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { Note } from '../types';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (id: string, updates: Partial<Note>) => void;
  editingNote?: Note;
  loading?: boolean;
}

const noteCategories = [
  'Personal',
  'Work',
  'Finance',
  'Health',
  'Travel',
  'Ideas',
  'Recipes',
  'Other'
];

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingNote,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal',
    isFavorite: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens for new note
  useEffect(() => {
    if (isOpen && !editingNote) {
      setFormData({
        title: '',
        content: '',
        category: 'Personal',
        isFavorite: false,
      });
    }
  }, [isOpen, editingNote]);

  useEffect(() => {
    if (editingNote) {
      setFormData({
        title: editingNote.title,
        content: editingNote.content,
        category: editingNote.category,
        isFavorite: editingNote.isFavorite || false,
      });
    }
  }, [editingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      if (editingNote && onUpdate) {
        await onUpdate(editingNote.id, formData);
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
      <div className="bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-gray-700 flex flex-col">
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {editingNote ? 'Edit Note' : 'Add New Note'}
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
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400"
                  placeholder="e.g., Server Credentials, Meeting Notes"
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
                  className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white"
                >
                  {noteCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 font-mono"
                rows={12}
                placeholder="Enter your note content here..."
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorite"
                checked={formData.isFavorite}
                onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                className="rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-900"
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
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-2xl transition-all duration-300 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : editingNote ? 'Update' : 'Save'} Note
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};