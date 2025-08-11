import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import FilesPanel from '../components/FilesPanel';
import { sendMessageApi } from '../api';
import { AuthService } from '../services/authService';
import type { Message, User } from '../types/api';
import './ChatPage.css';

interface ChatPageProps {
  user: User;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilesPanelOpen, setIsFilesPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Petit délai pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Autoscroll quand les messages changent ou quand le loading change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    // Créer le message utilisateur
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      timestamp: new Date(),
      isUser: true
    };

    // Ajouter le message utilisateur immédiatement
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Appeler l'API pour obtenir la réponse du bot
      const response = await sendMessageApi(content, user.id, user.email);
      
      if (response.success && response.message) {
        setMessages(prev => [...prev, response.message!]);
      } else {
        // Gérer les erreurs
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: response.error || 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
          timestamp: new Date(),
          isUser: false
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Gérer les erreurs de réseau
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFiles = () => {
    setIsFilesPanelOpen(true);
  };

  const handleCloseFiles = () => {
    setIsFilesPanelOpen(false);
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      onLogout();
    }
  };

  return (
    <div className="chat-page">
      <Header 
        user={user}
        onLogout={handleLogout}
        onOpenFiles={handleOpenFiles}
        showUserInfo={true}
      />

      <div className="chat-content">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          username={user.username}
          messagesEndRef={messagesEndRef}
        />

        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      <FilesPanel 
        isOpen={isFilesPanelOpen}
        onClose={handleCloseFiles}
      />
    </div>
  );
};

export default ChatPage;
