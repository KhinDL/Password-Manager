export interface PasswordEntry {
  id: string;
  userId?: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}