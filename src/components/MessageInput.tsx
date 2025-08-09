import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [inputMessage, setInputMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus automatique sur l'input quand le loading se termine
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Focus initial au montage du composant
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
      // Focus sera remis automatiquement via useEffect quand isLoading redevient false
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        ref={inputRef}
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={isLoading ? "En attente de réponse..." : "Tapez votre message..."}
        className="message-input"
      />
      <button
        type="submit"
        disabled={!inputMessage.trim() || isLoading}
        className="send-button"
      >
        {isLoading ? (
          <span className="loading-spinner">⏳</span>
        ) : (
          'Envoyer'
        )}
      </button>
    </form>
  );
};

export default MessageInput;
