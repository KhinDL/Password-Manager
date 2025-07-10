import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PasswordEntry } from '../types';
import { authService } from './authService';

const COLLECTION_NAME = 'passwords';

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Convert Date to Firestore timestamp
const convertToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const passwordService = {
  // Get all passwords for the current user
  async getPasswords(): Promise<PasswordEntry[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const passwordsRef = collection(db, COLLECTION_NAME);
      const q = query(
        passwordsRef,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const passwords: PasswordEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        passwords.push({
          id: doc.id,
          title: data.title,
          username: data.username,
          password: data.password,
          url: data.url || '',
          notes: data.notes || '',
          category: data.category,
          userId: data.userId,
          isFavorite: data.isFavorite || false,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        });
      });
      
      return passwords;
    } catch (error) {
      console.error('Error fetching passwords:', error);
      throw new Error('Failed to fetch passwords');
    }
  },

  // Add new password to Firestore
  async addPassword(password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const now = new Date();
      const passwordData = {
        ...password,
        userId: currentUser.uid,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), passwordData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding password:', error);
      throw new Error('Failed to add password');
    }
  },

  // Update password in Firestore
  async updatePassword(id: string, updates: Partial<PasswordEntry>): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const passwordRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...updates,
        updatedAt: convertToTimestamp(new Date()),
      };

      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.userId;

      await updateDoc(passwordRef, updateData);
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Failed to update password');
    }
  },

  // Delete password from Firestore
  async deletePassword(id: string): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const passwordRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(passwordRef);
    } catch (error) {
      console.error('Error deleting password:', error);
      throw new Error('Failed to delete password');
    }
  },
};