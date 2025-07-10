import { useState, useEffect } from 'react';
import { PasswordEntry, Category } from '../types';
import { passwordService } from '../services/passwordService';
import { authService } from '../services/authService';
import { User } from 'firebase/auth';

const FIXED_PASSWORD = 'password';

export const usePasswordManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Social Media', icon: 'Users', color: '#3B82F6' },
    { id: '2', name: 'Work', icon: 'Briefcase', color: '#10B981' },
    { id: '3', name: 'Banking', icon: 'CreditCard', color: '#F59E0B' },
    { id: '4', name: 'Entertainment', icon: 'Play', color: '#EF4444' },
    { id: '5', name: 'Shopping', icon: 'ShoppingCart', color: '#8B5CF6' },
    { id: '6', name: 'Other', icon: 'Folder', color: '#6B7280' },
  ]);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPasswords();
    }
  }, [isAuthenticated]);

  const loadPasswords = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPasswords = await passwordService.getPasswords();
      setPasswords(fetchedPasswords);
    } catch (err) {
      setError('Failed to load passwords');
      console.error('Error loading passwords:', err);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (masterPassword: string): Promise<boolean> => {
    let success = false;
    try {
      setLoading(true);
      setError(null);
      
      success = await authService.signIn(masterPassword);
      if (success) {
        // Keep loading state active while passwords are being fetched
        // loadPasswords will be called by the useEffect when isAuthenticated changes
      }
      return success;
    } catch (err) {
      setError('Authentication failed');
      console.error('Authentication error:', err);
      return false;
    } finally {
      // Don't set loading to false here if authentication succeeded
      // Let loadPasswords handle the loading state
      if (!success) {
        setLoading(false);
      }
    }
  };

  const addPassword = async (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const id = await passwordService.addPassword(password);
      
      const newPassword: PasswordEntry = {
        ...password,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setPasswords(prev => [newPassword, ...prev]);
    } catch (err) {
      setError('Failed to add password');
      console.error('Error adding password:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (id: string, updates: Partial<PasswordEntry>) => {
    try {
      setLoading(true);
      setError(null);
      await passwordService.updatePassword(id, updates);
      
      setPasswords(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ));
    } catch (err) {
      setError('Failed to update password');
      console.error('Error updating password:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePassword = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await passwordService.deletePassword(id);
      setPasswords(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete password');
      console.error('Error deleting password:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setPasswords([]);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return {
    isAuthenticated,
    user,
    passwords,
    categories,
    loading,
    error,
    authenticate,
    addPassword,
    updatePassword,
    deletePassword,
    logout,
    refreshPasswords: loadPasswords,
  };
};