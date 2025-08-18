import React from 'react';
import { Shield, ShieldCheck, ShieldX } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password, className = '' }) => {
  const calculateStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: 'No password', color: 'text-gray-400' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      longLength: password.length >= 12,
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { score, label: 'Medium', color: 'text-yellow-500' };
    return { score, label: 'Strong', color: 'text-green-500' };
  };

  const strength = calculateStrength(password);
  const percentage = Math.min((strength.score / 6) * 100, 100);

  const getIcon = () => {
    if (strength.score <= 2) return <ShieldX className="w-4 h-4" />;
    if (strength.score <= 4) return <Shield className="w-4 h-4" />;
    return <ShieldCheck className="w-4 h-4" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`p-1 rounded-lg ${
        strength.score <= 2 ? 'bg-red-500/20' : 
        strength.score <= 4 ? 'bg-yellow-500/20' : 
        'bg-green-500/20'
      }`}>
        {getIcon()}
      </div>
      <span className={`text-xl font-bold ${strength.color} tracking-wide`}>
        {strength.label}
      </span>
      <div className={`w-20 h-3 bg-gray-700 rounded-full overflow-hidden`}>
        <div 
          className={`h-full transition-all duration-300 ${
            strength.score <= 2 ? 'bg-red-500' : 
            strength.score <= 4 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={`w-16 h-2 bg-gray-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full transition-all duration-300 ${
            strength.score <= 2 ? 'bg-red-500' : 
            strength.score <= 4 ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};