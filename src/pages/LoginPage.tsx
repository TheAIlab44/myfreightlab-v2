import React, { useState } from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import { AuthService } from '../services/authService';
import type { User } from '../types/api';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await AuthService.login({ email, password });
      
      if (response.success && response.user && response.token) {
        const user: User = {
          ...response.user,
          isLoggedIn: true
        };
        onLogin(user, response.token);
      } else {
        setError(response.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h1>Connexion</h1>
            <p>Connectez-vous à votre espace de discussion</p>
          </div>
          
          <LoginForm 
            onSubmit={handleLogin}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
