import React, { useState } from 'react';
import './LoginForm.css';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string}>({});

  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && !isLoading) {
      onSubmit(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className={validationErrors.email ? 'error' : ''}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        {validationErrors.email && (
          <span className="error-message">{validationErrors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Votre mot de passe"
          className={validationErrors.password ? 'error' : ''}
          disabled={isLoading}
          autoComplete="current-password"
          required
        />
        {validationErrors.password && (
          <span className="error-message">{validationErrors.password}</span>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className="login-button"
        disabled={isLoading}
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};

export default LoginForm;
