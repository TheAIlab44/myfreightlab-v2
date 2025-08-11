import React from 'react';
import './Header.css';

interface HeaderProps {
  user?: {
    username: string;
    email: string;
  };
  onLogout?: () => void;
  onOpenFiles?: () => void;
  showUserInfo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenFiles, showUserInfo = false }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <img 
            src="/cropped-2.png" 
            alt="My Freight Lab" 
            className="app-logo"
          />
        </div>

        {showUserInfo && user && (
          <div className="user-section">
            <button 
              onClick={onOpenFiles}
              className="files-button"
              title="Mes fichiers"
            >
              📁
            </button>
            
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
            {onLogout && (
              <button onClick={onLogout} className="logout-button">
                Déconnexion
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
