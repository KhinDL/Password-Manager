import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Check } from 'lucide-react';
import { Category } from '../types';
import { aiService } from '../services/aiService';
import * as LucideIcons from 'lucide-react';

interface SmartCategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  title?: string;
  url?: string;
  className?: string;
}

export const SmartCategorySelector: React.FC<SmartCategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  title = '',
  url = '',
  className = ''
}) => {
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    if (title.trim()) {
      const suggestion = aiService.suggestCategory(title, url);
      if (suggestion.confidence > 0.3) {
        setAiSuggestion(suggestion);
        setShowSuggestion(true);
      } else {
        setAiSuggestion(null);
        setShowSuggestion(false);
      }
    }
  }, [title, url]);

  const applySuggestion = () => {
    if (aiSuggestion) {
      const suggestedCategory = categories.find(cat => cat.name === aiSuggestion.category);
      if (suggestedCategory) {
        onCategoryChange(suggestedCategory.id);
        setShowSuggestion(false);
      }
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-300">
          Category
        </label>
        {aiSuggestion && showSuggestion && (
          <button
            onClick={applySuggestion}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors font-medium"
          >
            <Brain className="w-3 h-3" />
            <span>Apply AI Suggestion</span>
          </button>
        )}
      </div>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-gray-900/50 backdrop-blur-sm text-white"
      >
        {categories.map(category => {
          const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;
          return (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          );
        })}
      </select>

      {/* AI Suggestion Display */}
      {aiSuggestion && showSuggestion && (
        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">AI Suggestion</span>
              <span className={`text-xs ${getConfidenceColor(aiSuggestion.confidence)}`}>
                {getConfidenceText(aiSuggestion.confidence)}
              </span>
            </div>
            <button
              onClick={() => setShowSuggestion(false)}
              className="text-gray-400 hover:text-gray-300 text-xs"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white mb-1">
                Suggested: {aiSuggestion.category}
              </div>
              <div className="text-xs text-gray-400">
                {aiSuggestion.reasoning}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-xs text-gray-400">
                {Math.round(aiSuggestion.confidence * 100)}% match
              </div>
              <button
                onClick={applySuggestion}
                className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};