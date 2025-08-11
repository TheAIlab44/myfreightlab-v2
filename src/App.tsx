import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { AuthService } from './services/authService';
import type { User } from './types/api';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  console.log('App user state:', user);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au chargement de l'app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (AuthService.hasStoredSession()) {
          const session = await AuthService.restoreSession();
          if (session) {
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la restauration de session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (loggedInUser: User, _authToken: string) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  // Affichage de chargement pendant la vérification de session
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {user && user.isLoggedIn ? (
        <ChatPage 
          user={user} 
          onLogout={handleLogout} 
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
