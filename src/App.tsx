import React from 'react';
import { usePasswordManager } from './hooks/usePasswordManager';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function App() {
  const {
    isAuthenticated,
    passwords,
    categories,
    loading,
    error,
    authenticate,
    addPassword,
    updatePassword,
    deletePassword,
    logout,
  } = usePasswordManager();

  if (!isAuthenticated) {
    return <LoginForm onLogin={authenticate} />;
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg z-50 border border-red-400">
          <p className="font-medium">{error}</p>
        </div>
      )}
      <Dashboard
        passwords={passwords}
        categories={categories}
        loading={loading}
        onAddPassword={addPassword}
        onUpdatePassword={updatePassword}
        onDeletePassword={deletePassword}
        onLogout={logout}
      />
    </>
  );
}

export default App;