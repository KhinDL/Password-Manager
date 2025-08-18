import React, { useState, useMemo } from 'react';
import { Search, Plus, LogOut, Filter, Download, Upload, Star, Grid, List, Eye, EyeOff, Copy, Edit2, Trash2, ExternalLink, Check, FileText, StickyNote, Menu, Lock, ChevronLeft, ChevronRight, X, Shield } from 'lucide-react';
import { PasswordCard } from './PasswordCard';
import { PasswordModal } from './PasswordModal';
import { NotesModal } from './NotesModal';
import { AuthModal } from './AuthModal';
import { PasswordEntry, Category, Note, AuthEntry } from '../types';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { AIInsights } from './AIInsights';
import { SmartPasswordGenerator } from './SmartPasswordGenerator';
import * as LucideIcons from 'lucide-react';

interface DashboardProps {
  passwords: PasswordEntry[];
  categories: Category[];
  loading?: boolean;
  onAddPassword: (password: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePassword: (id: string, updates: Partial<PasswordEntry>) => void;
  onDeletePassword: (id: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  passwords,
  categories,
  loading = false,
  onAddPassword,
  onUpdatePassword,
  onDeletePassword,
  onLogout,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | undefined>();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [editingAuth, setEditingAuth] = useState<AuthEntry | undefined>();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState<'passwords' | 'notes' | 'auth'>('passwords');
  const [selectedPassword, setSelectedPassword] = useState<PasswordEntry | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedAuth, setSelectedAuth] = useState<AuthEntry | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  
  // Mock notes data - in a real app, this would come from props
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Server Credentials',
      content: 'Production server details:\nIP: 192.168.1.100\nSSH Key: ~/.ssh/prod_key\nBackup schedule: Daily at 2 AM',
      category: 'Work',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isFavorite: true
    },
    {
      id: '2',
      title: 'WiFi Passwords',
      content: 'Home WiFi: MyNetwork123!\nGuest WiFi: Guest2024\nOffice WiFi: CompanySecure456',
      category: 'Personal',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
      isFavorite: false
    }
  ]);
  
  // Mock auth data - in a real app, this would come from props
  const [auths, setAuths] = useState<AuthEntry[]>([
    {
      id: '1',
      title: 'Google 2FA',
      type: 'totp',
      secret: 'JBSWY3DPEHPK3PXP',
      issuer: 'Google',
      account: 'user@gmail.com',
      category: 'Email',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isFavorite: true
    },
    {
      id: '2',
      title: 'GitHub Backup Codes',
      type: 'backup_codes',
      codes: ['12345-67890', '09876-54321', '11111-22222'],
      category: 'Work',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
      isFavorite: false
    }
  ]);

  const filteredPasswords = useMemo(() => {
    return passwords.filter(password => {
      const matchesSearch = password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           password.url?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || password.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || password.isFavorite;
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [passwords, searchTerm, selectedCategory, showFavoritesOnly]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFavorites = !showFavoritesOnly || note.isFavorite;
      
      return matchesSearch && matchesFavorites;
    });
  }, [notes, searchTerm, showFavoritesOnly]);

  const filteredAuths = useMemo(() => {
    return auths.filter(auth => {
      const matchesSearch = auth.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           auth.issuer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           auth.account?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFavorites = !showFavoritesOnly || auth.isFavorite;
      
      return matchesSearch && matchesFavorites;
    });
  }, [auths, searchTerm, showFavoritesOnly]);

  const handleEditPassword = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNotesModalOpen(true);
  };

  const handleEditAuth = (auth: AuthEntry) => {
    setEditingAuth(auth);
    setIsAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPassword(undefined);
  };

  const handleCloseNotesModal = () => {
    setIsNotesModalOpen(false);
    setEditingNote(undefined);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setEditingAuth(undefined);
  };

  const handleToggleFavorite = (id: string) => {
    const password = passwords.find(p => p.id === id);
    if (password) {
      onUpdatePassword(id, { isFavorite: !password.isFavorite });
    }
  };

  const handleToggleNoteFavorite = (id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, isFavorite: !note.isFavorite } : note
    ));
  };

  const handleToggleAuthFavorite = (id: string) => {
    setAuths(prev => prev.map(auth => 
      auth.id === id ? { ...auth, isFavorite: !auth.isFavorite } : auth
    ));
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const handleSaveAuth = (authData: Omit<AuthEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAuth: AuthEntry = {
      ...authData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAuths(prev => [newAuth, ...prev]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
    ));
  };

  const handleUpdateAuth = (id: string, updates: Partial<AuthEntry>) => {
    setAuths(prev => prev.map(auth => 
      auth.id === id ? { ...auth, ...updates, updatedAt: new Date() } : auth
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleDeleteAuth = (id: string) => {
    setAuths(prev => prev.filter(auth => auth.id !== id));
    if (selectedAuth?.id === id) {
      setSelectedAuth(null);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const exportPasswords = () => {
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'passwords-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = useMemo(() => {
    const total = passwords.length;
    const favorites = passwords.filter(p => p.isFavorite).length;
    const weak = passwords.filter(p => p.password.length < 8).length;
    const strong = passwords.filter(p => p.password.length >= 12 && /[A-Z]/.test(p.password) && /[a-z]/.test(p.password) && /\d/.test(p.password) && /[!@#$%^&*(),.?":{}|<>]/.test(p.password)).length;
    const notesCount = notes.length;
    const favoriteNotes = notes.filter(n => n.isFavorite).length;
    const authsCount = auths.length;
    const favoriteAuths = auths.filter(a => a.isFavorite).length;
    
    return { total, favorites, weak, strong, notesCount, favoriteNotes, authsCount, favoriteAuths };
  }, [passwords, notes, auths]);

  const renderPasswordRow = (password: PasswordEntry) => {
    const category = categories.find(c => c.id === password.category) || categories[0];
    const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;
    const isPasswordVisible = showPasswords[password.id];

    return (
      <tr 
        key={password.id}
        className={`border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
          selectedPassword?.id === password.id ? 'bg-gray-700/70' : ''
        }`}
        onClick={() => setSelectedPassword(password)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: category.color }}
            >
              <IconComponent className="w-3 h-3" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white text-sm">{password.title}</span>
                {password.isFavorite && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                )}
              </div>
              <span className="text-xs text-gray-400">{category.name}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300 font-mono text-xs">
          {password.username}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs text-gray-300">
              {isPasswordVisible ? password.password : '••••••••'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePasswordVisibility(password.id);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(password.password, `password-${password.id}`);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {copiedField === `password-${password.id}` ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </td>
        <td className="px-4 py-3">
          <PasswordStrengthIndicator password={password.password} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(password.id);
              }}
              className={`p-0.5 rounded transition-colors ${
                password.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Star className={`w-3 h-3 ${password.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditPassword(password);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePassword(password.id);
              }}
              className="p-0.5 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderNoteRow = (note: Note) => {
    return (
      <tr 
        key={note.id}
        className={`border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
          selectedNote?.id === note.id ? 'bg-gray-700/70' : ''
        }`}
        onClick={() => setSelectedNote(note)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-purple-600 text-white text-xs">
              <FileText className="w-3 h-3" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white text-sm">{note.title}</span>
                {note.isFavorite && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                )}
              </div>
              <span className="text-xs text-gray-400">{note.category}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300 text-xs">
          <div className="max-w-xs truncate">
            {note.content}
          </div>
        </td>
        <td className="px-4 py-3 text-gray-400 text-xs">
          {note.updatedAt.toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleNoteFavorite(note.id);
              }}
              className={`p-0.5 rounded transition-colors ${
                note.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Star className={`w-3 h-3 ${note.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditNote(note);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteNote(note.id);
              }}
              className="p-0.5 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderAuthRow = (auth: AuthEntry) => {
    return (
      <tr 
        key={auth.id}
        className={`border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
          selectedAuth?.id === auth.id ? 'bg-gray-700/70' : ''
        }`}
        onClick={() => setSelectedAuth(auth)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-green-600 text-white text-xs">
              <Shield className="w-3 h-3" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white text-sm">{auth.title}</span>
                {auth.isFavorite && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                )}
              </div>
              <span className="text-xs text-gray-400">{auth.category}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-300 text-xs">
          <span className="capitalize">{auth.type.replace('_', ' ')}</span>
        </td>
        <td className="px-4 py-3 text-gray-300 font-mono text-xs">
          {auth.account || auth.issuer || '-'}
        </td>
        <td className="px-4 py-3 text-gray-400 text-xs">
          {auth.updatedAt.toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAuthFavorite(auth.id);
              }}
              className={`p-0.5 rounded transition-colors ${
                auth.isFavorite
                  ? 'text-yellow-500 hover:text-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Star className={`w-3 h-3 ${auth.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditAuth(auth);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteAuth(auth.id);
              }}
              className="p-0.5 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-14' : 'w-56'} bg-gray-800 shadow-lg border-r border-gray-700 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-3 border-b border-gray-700">
          <div className="flex items-center justify-center">
              {!sidebarCollapsed && (
                <>
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-white font-bold text-xs">VG</span>
                  </div>
                  <h1 className="text-lg font-bold text-white">VaultGuard</h1>
                </>
              )}
              {sidebarCollapsed && (
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">VG</span>
                </div>
              )}
          </div>
        </div>

        {/* Tabs */}
        <div className={`p-2 border-b border-gray-700 ${sidebarCollapsed ? 'px-1' : ''}`}>
          <div className={`flex ${sidebarCollapsed ? 'flex-col space-y-1' : 'space-x-1'} bg-gray-700 rounded-lg p-1`}>
            <button
              onClick={() => {
                setActiveTab('passwords');
                setSelectedNote(null);
                setSelectedPassword(null);
                setSelectedAuth(null);
              }}
              className={`flex-1 flex items-center justify-center ${sidebarCollapsed ? '' : 'space-x-2'} px-2 py-1.5 rounded-md transition-colors ${
                activeTab === 'passwords'
                  ? 'bg-cyan-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
              title={sidebarCollapsed ? 'Passwords' : ''}
            >
              <Lock className="w-3 h-3" />
              {!sidebarCollapsed && <span className="text-xs font-medium">Passwords</span>}
            </button>
            <button
              onClick={() => {
                setActiveTab('notes');
                setSelectedPassword(null);
                setSelectedNote(null);
                setSelectedAuth(null);
              }}
              className={`flex-1 flex items-center justify-center ${sidebarCollapsed ? '' : 'space-x-2'} px-2 py-1.5 rounded-md transition-colors ${
                activeTab === 'notes'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
              title={sidebarCollapsed ? 'Notes' : ''}
            >
              <StickyNote className="w-3 h-3" />
              {!sidebarCollapsed && <span className="text-xs font-medium">Notes</span>}
            </button>
            <button
              onClick={() => {
                setActiveTab('auth');
                setSelectedPassword(null);
                setSelectedNote(null);
                setSelectedAuth(null);
              }}
              className={`flex-1 flex items-center justify-center ${sidebarCollapsed ? '' : 'space-x-2'} px-2 py-1.5 rounded-md transition-colors ${
                activeTab === 'auth'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
              title={sidebarCollapsed ? 'Authentication' : ''}
            >
              <Shield className="w-3 h-3" />
              {!sidebarCollapsed && <span className="text-xs font-medium">Auth</span>}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex-1 p-2 ${sidebarCollapsed ? 'px-1' : ''}`}>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} ${
                selectedCategory === 'all'
                  ? 'bg-cyan-600/20 text-cyan-400 font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              title={sidebarCollapsed ? 'All Items' : ''}
            >
              <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold text-[10px]">
                  {activeTab === 'passwords' ? stats.total : activeTab === 'notes' ? stats.notesCount : stats.authsCount}
                </span>
              </div>
              {!sidebarCollapsed && <span className="text-sm">All Items</span>}
            </button>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} ${
                showFavoritesOnly
                  ? 'bg-yellow-600/20 text-yellow-400 font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              title={sidebarCollapsed ? 'Favorites' : ''}
            >
              <div className="w-5 h-5 bg-yellow-600 rounded flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-white fill-current" />
              </div>
              {!sidebarCollapsed && (
                <>
                  <span className="text-sm">Favorites</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {activeTab === 'passwords' ? stats.favorites : activeTab === 'notes' ? stats.favoriteNotes : stats.favoriteAuths}
                  </span>
                </>
              )}
            </button>

            {activeTab === 'passwords' && (
              <>
                {!sidebarCollapsed && (
                  <div className="pt-2 pb-1">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Categories</h3>
                  </div>
                )}

                {categories.map(category => {
                  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Folder;
                  const count = passwords.filter(p => p.category === category.id).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} ${
                        selectedCategory === category.id
                          ? 'bg-cyan-600/20 text-cyan-400 font-medium'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                      title={sidebarCollapsed ? category.name : ''}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="w-2.5 h-2.5" />
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <span className="text-sm">{category.name}</span>
                          <span className="ml-auto text-xs text-gray-400">{count}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-2 border-t border-gray-700 ${sidebarCollapsed ? 'px-1' : ''}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'flex-col space-y-2' : 'justify-between'} mb-3`}>
            <button
              onClick={exportPasswords}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Export passwords" : "Export passwords"}
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Logout" : "Logout"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          
          {/* Chevron Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-800 shadow-sm border-b border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64 bg-gray-700 text-white placeholder-gray-400 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === 'passwords' && (
                <div className="flex items-center bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-gray-600 text-cyan-400 shadow-sm'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-gray-600 text-cyan-400 shadow-sm'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  if (activeTab === 'passwords') {
                    setIsModalOpen(true);
                  } else if (activeTab === 'notes') {
                    setIsNotesModalOpen(true);
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                disabled={loading}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  activeTab === 'passwords' 
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : activeTab === 'notes'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {activeTab === 'passwords' ? 'Password' : activeTab === 'notes' ? 'Note' : 'Auth'}</span>
              </button>
              
              {activeTab === 'passwords' && (
                <button
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    showAIInsights
                      ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  AI Insights
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Main List */}
          <div className={`flex-1 overflow-hidden ${showAIInsights && activeTab === 'passwords' ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' : ''}`}>
            {/* AI Insights Panel */}
            {showAIInsights && activeTab === 'passwords' && (
              <div className="lg:col-span-1 overflow-y-auto">
                <AIInsights 
                  passwords={filteredPasswords}
                  onPasswordSelect={(passwordId) => {
                    const password = passwords.find(p => p.id === passwordId);
                    if (password) {
                      setSelectedPassword(password);
                    }
                  }}
                />
              </div>
            )}
            
            {/* Main Content Area */}
            <div className={`${showAIInsights && activeTab === 'passwords' ? 'lg:col-span-2' : ''} overflow-hidden`}>
            <div className="flex-1 bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-400">Loading {activeTab}...</p>
                </div>
              </div>
            ) : activeTab === 'passwords' ? (
              filteredPasswords.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Search className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-white mb-2">No passwords found</h3>
                    <p className="text-gray-400 mb-3 text-sm">
                      {searchTerm || selectedCategory !== 'all' || showFavoritesOnly
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first password."}
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Password</span>
                    </button>
                  </div>
                </div>
              ) : viewMode === 'list' ? (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Password
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Strength
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {filteredPasswords.map(renderPasswordRow)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPasswords.map((password) => {
                      const category = categories.find(c => c.id === password.category) || categories[0];
                      return (
                        <PasswordCard
                          key={password.id}
                          password={password}
                          category={category}
                          onEdit={handleEditPassword}
                          onDelete={onDeletePassword}
                          onToggleFavorite={handleToggleFavorite}
                          loading={loading}
                        />
                      );
                    })}
                  </div>
                </div>
              )
            ) : activeTab === 'notes' ? (
              // Notes view
              filteredNotes.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <StickyNote className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-white mb-2">No notes found</h3>
                    <p className="text-gray-400 mb-3 text-sm">
                      {searchTerm || showFavoritesOnly
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first note."}
                    </p>
                    <button
                      onClick={() => setIsNotesModalOpen(true)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Content
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Modified
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {filteredNotes.map(renderNoteRow)}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Authentication view
              filteredAuths.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Shield className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-white mb-2">No authentication entries found</h3>
                    <p className="text-gray-400 mb-3 text-sm">
                      {searchTerm || showFavoritesOnly
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first authentication entry."}
                    </p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Authentication</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800 border-b border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Modified
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {filteredAuths.map(renderAuthRow)}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
            </div>

          {/* Details Panel */}
          {((selectedPassword && activeTab === 'passwords' && viewMode === 'list') || 
            (selectedNote && activeTab === 'notes') ||
            (selectedAuth && activeTab === 'auth')) && (
            <div className="w-72 bg-gray-800 border-l border-gray-700 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">
                    {activeTab === 'passwords' ? 'Password Details' : activeTab === 'notes' ? 'Note Details' : 'Authentication Details'}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedPassword(null);
                      setSelectedNote(null);
                      setSelectedAuth(null);
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {activeTab === 'passwords' && selectedPassword && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
                      <p className="text-white text-sm">{selectedPassword.title}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Username</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-mono text-sm">{selectedPassword.username}</p>
                        <button
                          onClick={() => copyToClipboard(selectedPassword.username, 'detail-username')}
                          className="p-0.5 text-gray-400 hover:text-gray-300"
                        >
                          {copiedField === 'detail-username' ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-mono text-sm">
                          {showPasswords[selectedPassword.id] ? selectedPassword.password : '••••••••'}
                        </p>
                        <button
                          onClick={() => togglePasswordVisibility(selectedPassword.id)}
                          className="p-0.5 text-gray-400 hover:text-gray-300"
                        >
                          {showPasswords[selectedPassword.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(selectedPassword.password, 'detail-password')}
                          className="p-0.5 text-gray-400 hover:text-gray-300"
                        >
                          {copiedField === 'detail-password' ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Password Strength</label>
                      <PasswordStrengthIndicator password={selectedPassword.password} />
                    </div>

                    {selectedPassword.url && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Website</label>
                        <a
                          href={selectedPassword.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1 text-sm"
                        >
                          <span>{selectedPassword.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {selectedPassword.notes && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Notes</label>
                        <p className="text-white text-xs bg-gray-700 p-2 rounded border border-gray-600">{selectedPassword.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => handleEditPassword(selectedPassword)}
                        className="flex items-center space-x-1 px-2 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(selectedPassword.id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                          selectedPassword.isFavorite
                            ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${selectedPassword.isFavorite ? 'fill-current' : ''}`} />
                        <span>{selectedPassword.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && selectedNote && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
                      <p className="text-white text-sm">{selectedNote.title}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
                      <p className="text-gray-300 text-sm">{selectedNote.category}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Content</label>
                      <div className="bg-gray-700 p-2 rounded border border-gray-600 max-h-48 overflow-y-auto">
                        <pre className="text-white text-xs whitespace-pre-wrap">{selectedNote.content}</pre>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Last Modified</label>
                      <p className="text-gray-300 text-xs">{selectedNote.updatedAt.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => handleEditNote(selectedNote)}
                        className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleNoteFavorite(selectedNote.id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                          selectedNote.isFavorite
                            ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${selectedNote.isFavorite ? 'fill-current' : ''}`} />
                        <span>{selectedNote.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'auth' && selectedAuth && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Title</label>
                      <p className="text-white text-sm">{selectedAuth.title}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Type</label>
                      <p className="text-gray-300 text-sm capitalize">{selectedAuth.type.replace('_', ' ')}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
                      <p className="text-gray-300 text-sm">{selectedAuth.category}</p>
                    </div>

                    {selectedAuth.issuer && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Issuer</label>
                        <p className="text-white text-sm">{selectedAuth.issuer}</p>
                      </div>
                    )}

                    {selectedAuth.account && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Account</label>
                        <p className="text-white text-sm font-mono">{selectedAuth.account}</p>
                      </div>
                    )}

                    {selectedAuth.secret && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Secret</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-mono text-sm">
                            {showPasswords[selectedAuth.id] ? selectedAuth.secret : '••••••••••••••••'}
                          </p>
                          <button
                            onClick={() => togglePasswordVisibility(selectedAuth.id)}
                            className="p-0.5 text-gray-400 hover:text-gray-300"
                          >
                            {showPasswords[selectedAuth.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(selectedAuth.secret!, 'detail-auth-secret')}
                            className="p-0.5 text-gray-400 hover:text-gray-300"
                          >
                            {copiedField === 'detail-auth-secret' ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedAuth.codes && selectedAuth.codes.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Backup Codes</label>
                        <div className="bg-gray-700 p-2 rounded border border-gray-600 max-h-32 overflow-y-auto">
                          {selectedAuth.codes.map((code, index) => (
                            <div key={index} className="flex items-center justify-between py-1">
                              <span className="text-white font-mono text-xs">{code}</span>
                              <button
                                onClick={() => copyToClipboard(code, `detail-code-${index}`)}
                                className="p-0.5 text-gray-400 hover:text-gray-300"
                              >
                                {copiedField === `detail-code-${index}` ? (
                                  <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAuth.questions && selectedAuth.questions.length > 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Security Questions</label>
                        <div className="bg-gray-700 p-2 rounded border border-gray-600 max-h-32 overflow-y-auto space-y-2">
                          {selectedAuth.questions.map((qa, index) => (
                            <div key={index} className="text-xs">
                              <p className="text-gray-300 mb-1">{qa.question}</p>
                              <p className="text-white font-mono">{qa.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedAuth.notes && (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Notes</label>
                        <p className="text-white text-xs bg-gray-700 p-2 rounded border border-gray-600">{selectedAuth.notes}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">Last Modified</label>
                      <p className="text-gray-300 text-xs">{selectedAuth.updatedAt.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-700">
                      <button
                        onClick={() => handleEditAuth(selectedAuth)}
                        className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleAuthFavorite(selectedAuth.id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                          selectedAuth.isFavorite
                            ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${selectedAuth.isFavorite ? 'fill-current' : ''}`} />
                        <span>{selectedAuth.isFavorite ? 'Unfavorite' : 'Favorite'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={onAddPassword}
        onUpdate={onUpdatePassword}
        categories={categories}
        editingPassword={editingPassword}
        loading={loading}
      />

      {/* Notes Modal */}
      <NotesModal
        isOpen={isNotesModalOpen}
        onClose={handleCloseNotesModal}
        onSave={handleSaveNote}
        onUpdate={handleUpdateNote}
        editingNote={editingNote}
        loading={loading}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        onSave={handleSaveAuth}
        onUpdate={handleUpdateAuth}
        editingAuth={editingAuth}
        loading={loading}
      />
    </div>
  );
};