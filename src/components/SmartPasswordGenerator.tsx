import React, { useState, useEffect } from 'react';
import { Wand2, Copy, RefreshCw, Check, Sparkles, Brain, Settings } from 'lucide-react';
import { aiService } from '../services/aiService';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface SmartPasswordGeneratorProps {
  title?: string;
  onPasswordGenerated?: (password: string) => void;
  className?: string;
}

export const SmartPasswordGenerator: React.FC<SmartPasswordGeneratorProps> = ({
  title = '',
  onPasswordGenerated,
  className = ''
}) => {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState({
    length: 16,
    includeNumbers: true,
    includeSymbols: true,
    memorable: false
  });
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    generatePassword();
  }, [options, title]);

  const generatePassword = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newPassword = aiService.generateSmartPassword(title, options);
    setPassword(newPassword);
    
    if (onPasswordGenerated) {
      onPasswordGenerated(newPassword);
    }
    
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const analysis = password ? aiService.analyzePassword(password) : null;

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Password Generator</h3>
            <p className="text-sm text-gray-400">Smart, secure password generation</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Generated Password Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-300">Generated Password</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={generatePassword}
              disabled={isGenerating}
              className="flex items-center space-x-1 px-3 py-1 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-colors font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={password}
            readOnly
            className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-2xl bg-gray-900/50 backdrop-blur-sm text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder={isGenerating ? "Generating..." : "Click generate to create password"}
          />
          <button
            onClick={copyToClipboard}
            disabled={!password}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        {analysis && (
          <div className="mt-3">
            <PasswordStrengthIndicator password={password} />
            <div className="mt-2 text-xs text-gray-400">
              Entropy: {analysis.entropy} bits • Estimated crack time: {analysis.estimatedCrackTime}
            </div>
          </div>
        )}
      </div>

      {/* Quick Options */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setOptions(prev => ({ ...prev, memorable: false, length: 16, includeSymbols: true }))}
          className={`p-3 rounded-2xl border-2 transition-all flex items-center space-x-2 ${
            !options.memorable && options.length === 16 && options.includeSymbols
              ? 'border-purple-500 bg-purple-500/20 text-purple-400'
              : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-gray-500'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Maximum Security</span>
        </button>
        
        <button
          onClick={() => setOptions(prev => ({ ...prev, memorable: true, length: 14, includeSymbols: false }))}
          className={`p-3 rounded-2xl border-2 transition-all flex items-center space-x-2 ${
            options.memorable
              ? 'border-purple-500 bg-purple-500/20 text-purple-400'
              : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-gray-500'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-sm font-medium">Memorable</span>
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-900/30 rounded-2xl border border-gray-600">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Advanced Options</h4>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Length: {options.length}</label>
            </div>
            <input
              type="range"
              min="8"
              max="32"
              value={options.length}
              onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => setOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                className="rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-900"
              />
              <span className="text-sm text-gray-300">Include Numbers</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => setOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                className="rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-900"
              />
              <span className="text-sm text-gray-300">Include Symbols</span>
            </label>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.memorable}
              onChange={(e) => setOptions(prev => ({ ...prev, memorable: e.target.checked }))}
              className="rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-900"
            />
            <span className="text-sm text-gray-300">Generate memorable password</span>
          </label>
        </div>
      )}

      {/* AI Suggestions */}
      {analysis && analysis.suggestions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">AI Suggestions</span>
          </div>
          <ul className="text-xs text-gray-300 space-y-1">
            {analysis.suggestions.slice(0, 2).map((suggestion, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};