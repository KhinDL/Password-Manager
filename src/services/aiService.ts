// AI Service for password analysis and recommendations
export interface PasswordAnalysis {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  issues: string[];
  suggestions: string[];
  estimatedCrackTime: string;
  entropy: number;
}

export interface SecurityRecommendation {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action: string;
  passwordId?: string;
}

export interface SmartCategory {
  category: string;
  confidence: number;
  reasoning: string;
}

class AIService {
  // Analyze password strength with detailed feedback
  analyzePassword(password: string): PasswordAnalysis {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length analysis
    if (password.length < 8) {
      issues.push('Password is too short');
      suggestions.push('Use at least 12 characters for better security');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Character variety analysis
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLower) {
      issues.push('Missing lowercase letters');
      suggestions.push('Add lowercase letters (a-z)');
    } else score += 1;

    if (!hasUpper) {
      issues.push('Missing uppercase letters');
      suggestions.push('Add uppercase letters (A-Z)');
    } else score += 1;

    if (!hasNumbers) {
      issues.push('Missing numbers');
      suggestions.push('Add numbers (0-9)');
    } else score += 1;

    if (!hasSymbols) {
      issues.push('Missing special characters');
      suggestions.push('Add special characters (!@#$%^&*)');
    } else score += 1;

    // Pattern analysis
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc/i,
      /(.)\1{2,}/,  // Repeated characters
    ];

    commonPatterns.forEach(pattern => {
      if (pattern.test(password)) {
        issues.push('Contains common patterns');
        suggestions.push('Avoid common patterns and repeated characters');
        score -= 1;
      }
    });

    // Calculate entropy
    const charset = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumbers ? 10 : 0) + (hasSymbols ? 32 : 0);
    const entropy = Math.log2(Math.pow(charset, password.length));

    // Estimate crack time
    const estimatedCrackTime = this.estimateCrackTime(entropy);

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong';
    if (score <= 3 || entropy < 40) strength = 'weak';
    else if (score <= 5 || entropy < 60) strength = 'medium';
    else strength = 'strong';

    return {
      strength,
      score: Math.max(0, Math.min(6, score)),
      issues,
      suggestions,
      estimatedCrackTime,
      entropy: Math.round(entropy)
    };
  }

  // Smart categorization based on title and URL
  suggestCategory(title: string, url?: string): SmartCategory {
    const titleLower = title.toLowerCase();
    const urlLower = url?.toLowerCase() || '';
    const combined = `${titleLower} ${urlLower}`;

    const categories = [
      {
        category: 'Social Media',
        keywords: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'discord', 'reddit', 'youtube'],
        confidence: 0
      },
      {
        category: 'Work',
        keywords: ['work', 'office', 'company', 'corporate', 'business', 'slack', 'teams', 'zoom', 'jira', 'confluence'],
        confidence: 0
      },
      {
        category: 'Banking',
        keywords: ['bank', 'credit', 'paypal', 'stripe', 'finance', 'investment', 'trading', 'wallet', 'crypto'],
        confidence: 0
      },
      {
        category: 'Entertainment',
        keywords: ['netflix', 'spotify', 'gaming', 'steam', 'xbox', 'playstation', 'twitch', 'hulu', 'disney'],
        confidence: 0
      },
      {
        category: 'Shopping',
        keywords: ['amazon', 'ebay', 'shop', 'store', 'retail', 'cart', 'buy', 'purchase', 'marketplace'],
        confidence: 0
      }
    ];

    // Calculate confidence scores
    categories.forEach(cat => {
      cat.keywords.forEach(keyword => {
        if (combined.includes(keyword)) {
          cat.confidence += 1;
          // Bonus for exact matches
          if (titleLower === keyword || urlLower.includes(keyword)) {
            cat.confidence += 0.5;
          }
        }
      });
    });

    // Find best match
    const bestMatch = categories.reduce((prev, current) => 
      current.confidence > prev.confidence ? current : prev
    );

    if (bestMatch.confidence === 0) {
      return {
        category: 'Other',
        confidence: 0.5,
        reasoning: 'No specific category patterns detected'
      };
    }

    return {
      category: bestMatch.category,
      confidence: Math.min(1, bestMatch.confidence / 2),
      reasoning: `Detected ${bestMatch.category.toLowerCase()} keywords in title/URL`
    };
  }

  // Generate security recommendations
  generateSecurityRecommendations(passwords: any[]): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Analyze password strengths
    const weakPasswords = passwords.filter(p => {
      const analysis = this.analyzePassword(p.password);
      return analysis.strength === 'weak';
    });

    if (weakPasswords.length > 0) {
      recommendations.push({
        type: 'critical',
        title: `${weakPasswords.length} Weak Password${weakPasswords.length > 1 ? 's' : ''} Found`,
        description: 'Weak passwords are vulnerable to attacks and should be updated immediately.',
        action: 'Update weak passwords with stronger alternatives',
        passwordId: weakPasswords[0].id
      });
    }

    // Check for duplicate passwords
    const passwordMap = new Map();
    passwords.forEach(p => {
      if (passwordMap.has(p.password)) {
        passwordMap.get(p.password).push(p);
      } else {
        passwordMap.set(p.password, [p]);
      }
    });

    const duplicates = Array.from(passwordMap.values()).filter(group => group.length > 1);
    if (duplicates.length > 0) {
      recommendations.push({
        type: 'warning',
        title: `${duplicates.length} Duplicate Password${duplicates.length > 1 ? 's' : ''} Found`,
        description: 'Using the same password for multiple accounts increases security risk.',
        action: 'Create unique passwords for each account'
      });
    }

    // Check for old passwords
    const oldPasswords = passwords.filter(p => {
      const daysSinceUpdate = (Date.now() - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 90;
    });

    if (oldPasswords.length > 0) {
      recommendations.push({
        type: 'info',
        title: `${oldPasswords.length} Password${oldPasswords.length > 1 ? 's' : ''} Not Updated Recently`,
        description: 'Consider updating passwords that haven\'t been changed in over 90 days.',
        action: 'Review and update old passwords'
      });
    }

    // General security tips
    if (passwords.length > 10) {
      recommendations.push({
        type: 'info',
        title: 'Enable Two-Factor Authentication',
        description: 'Add an extra layer of security to your most important accounts.',
        action: 'Set up 2FA for critical accounts'
      });
    }

    return recommendations;
  }

  // Generate smart password suggestions
  generateSmartPassword(title: string, options: {
    length?: number;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    memorable?: boolean;
  } = {}): string {
    const {
      length = 16,
      includeNumbers = true,
      includeSymbols = true,
      memorable = false
    } = options;

    if (memorable) {
      return this.generateMemorablePassword(title, length);
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = lowercase + uppercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    let password = '';
    
    // Ensure at least one character from each required set
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (includeNumbers) password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSymbols) password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private generateMemorablePassword(title: string, length: number): string {
    const words = [
      'Ocean', 'Mountain', 'River', 'Forest', 'Desert', 'Valley', 'Storm', 'Thunder',
      'Lightning', 'Rainbow', 'Sunset', 'Sunrise', 'Galaxy', 'Planet', 'Comet', 'Star',
      'Dragon', 'Phoenix', 'Eagle', 'Wolf', 'Tiger', 'Lion', 'Bear', 'Falcon',
      'Crystal', 'Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Gold', 'Silver', 'Platinum'
    ];

    const titleWord = title.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') || '';
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const number = Math.floor(Math.random() * 9999);
    const symbol = '!@#$%^&*'[Math.floor(Math.random() * 8)];

    let password = `${titleWord}${randomWord}${number}${symbol}`;
    
    // Adjust length if needed
    while (password.length < length) {
      password += Math.floor(Math.random() * 10);
    }
    
    return password.substring(0, length);
  }

  private estimateCrackTime(entropy: number): string {
    const attemptsPerSecond = 1e9; // 1 billion attempts per second
    const secondsToCrack = Math.pow(2, entropy - 1) / attemptsPerSecond;

    if (secondsToCrack < 60) return 'Less than a minute';
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`;
    return 'Centuries';
  }
}

export const aiService = new AIService();