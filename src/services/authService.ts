import { User } from 'firebase/auth';

// Demo credentials for the fixed password system
const DEMO_PASSWORD = 'password';

// Mock user object for demo purposes
const mockUser: User = {
  uid: 'demo-user-123',
  email: null,
  emailVerified: false,
  displayName: null,
  isAnonymous: true,
  phoneNumber: null,
  photoURL: null,
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({
    token: 'demo-token',
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    signInProvider: 'anonymous',
    signInSecondFactor: null,
    claims: {}
  }),
  reload: async () => {},
  toJSON: () => ({}),
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  }
};

// Simple state management for demo authentication
let currentUser: User | null = null;
let authStateListeners: ((user: User | null) => void)[] = [];

const notifyAuthStateChange = (user: User | null) => {
  authStateListeners.forEach(callback => callback(user));
};

export const authService = {
  // Sign in with the demo password
  async signIn(masterPassword: string): Promise<boolean> {
    try {
      if (masterPassword === DEMO_PASSWORD) {
        currentUser = mockUser;
        notifyAuthStateChange(currentUser);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Authentication error:', error);
      return false;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      currentUser = null;
      notifyAuthStateChange(currentUser);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    authStateListeners.push(callback);
    // Immediately call with current state
    callback(currentUser);
    
    // Return unsubscribe function
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== callback);
    };
  },

  // Get current user
  getCurrentUser(): User | null {
    return currentUser;
  }
};