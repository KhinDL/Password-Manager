import React, { useState, useEffect } from 'react';
import { Brain, Shield, AlertTriangle, Info, TrendingUp, Zap, Target, CheckCircle } from 'lucide-react';
import { PasswordEntry } from '../types';
import { aiService, SecurityRecommendation } from '../services/aiService';

interface AIInsightsProps {
  passwords: PasswordEntry[];
  onPasswordSelect?: (passwordId: string) => void;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ passwords, onPasswordSelect }) => {
  const [recommendations, setRecommendations] = useState<SecurityRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    if (passwords.length > 0) {
      analyzePasswords();
    }
  }, [passwords]);

  const analyzePasswords = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const recs = aiService.generateSecurityRecommendations(passwords);
    setRecommendations(recs);
    
    // Calculate overall security score
    const totalAnalyses = passwords.map(p => aiService.analyzePassword(p.password));
    const avgScore = totalAnalyses.reduce((sum, analysis) => sum + analysis.score, 0) / totalAnalyses.length;
    setSecurityScore(Math.round((avgScore / 6) * 100));
    
    setIsAnalyzing(false);
  };

  const getRecommendationIcon = (type: SecurityRecommendation['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Shield className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getRecommendationBg = (type: SecurityRecommendation['type']) => {
    switch (type) {
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (passwords.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-300 mb-2">AI Insights</h3>
        <p className="text-gray-400">Add some passwords to get AI-powered security insights and recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Security Score</h3>
              <p className="text-sm text-gray-400">Overall password security assessment</p>
            </div>
          </div>
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-purple-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
              <span className="text-sm">Analyzing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">Security Level</span>
              <span className={`text-2xl font-bold ${getScoreColor(securityScore)}`}>
                {securityScore}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreGradient(securityScore)} transition-all duration-1000 ease-out`}
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>
              {securityScore >= 80 ? '🛡️' : securityScore >= 60 ? '⚠️' : '🚨'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {passwords.filter(p => aiService.analyzePassword(p.password).strength === 'strong').length}
              </div>
              <div className="text-sm text-gray-400">Strong Passwords</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {passwords.filter(p => aiService.analyzePassword(p.password).strength === 'medium').length}
              </div>
              <div className="text-sm text-gray-400">Medium Passwords</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {passwords.filter(p => aiService.analyzePassword(p.password).strength === 'weak').length}
              </div>
              <div className="text-sm text-gray-400">Weak Passwords</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
            <p className="text-sm text-gray-400">Personalized security improvements</p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-green-400 mb-2">Excellent Security!</h4>
            <p className="text-gray-400">No immediate security concerns detected. Keep up the good work!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border backdrop-blur-sm ${getRecommendationBg(rec.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-300 mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-lg">
                        {rec.action}
                      </span>
                      {rec.passwordId && onPasswordSelect && (
                        <button
                          onClick={() => onPasswordSelect(rec.passwordId!)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          View Password →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};