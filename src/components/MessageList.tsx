import React from 'react';
import MarkdownContent from './MarkdownContent';
import type { Message } from '../types/api';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  username: string;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false, username, messagesEndRef }) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="messages-container">
      {messages.length === 0 && (
        <div className="welcome-message">
          Bienvenue dans le chat, {username} ! Envoyez votre premier message.
        </div>
      )}
      
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
        >
          <div className="message-content">
            <MarkdownContent content={message.content} isUser={message.isUser} />
          </div>
          <div className="message-time">
            {formatTime(message.timestamp)}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="message bot-message">
          <div className="message-content typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">L'assistant réfléchit...</span>
          </div>
        </div>
      )}
      
      {/* Élément de référence pour l'autoscroll */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
