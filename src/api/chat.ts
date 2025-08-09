import { ChatService } from '../services/chatService';
import type { ChatResponse } from '../types/api';

// API de chat - utilisée uniquement par les pages
export const sendMessageApi = async (
  message: string, 
  userId: string,
  userEmail: string
): Promise<ChatResponse> => {
  try {
    const result = await ChatService.sendMessage(message, userId, userEmail);
    
    if (result.success && result.botMessage) {
      return {
        success: true,
        message: result.botMessage
      };
    } else {
      return {
        success: false,
        error: result.error || 'Erreur lors de l\'envoi du message'
      };
    }
  } catch (error) {
    console.error('Send message API error:', error);
    return {
      success: false,
      error: 'Erreur de l\'API de chat'
    };
  }
};
