import { N8nService } from '../api/services/n8nService';
import type { Message } from '../types/api';

// Service de chat qui gère la logique métier
export class ChatService {
  // Envoyer un message et obtenir une réponse
  static async sendMessage(
    content: string,
    userId: string,
    userEmail: string
  ): Promise<{ success: boolean; botMessage?: Message; error?: string }> {
    try {
      // Appel au service n8n
      const n8nResponse = await N8nService.sendMessage(content, userId, userEmail);
      
      if (!n8nResponse.success) {
        return {
          success: false,
          error: n8nResponse.error || 'Erreur lors de l\'envoi du message'
        };
      }

      // Créer le message de réponse du bot
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: n8nResponse.response || 'Réponse reçue',
        timestamp: new Date(),
        isUser: false
      };

      return {
        success: true,
        botMessage
      };
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        success: false,
        error: 'Erreur interne du service de chat'
      };
    }
  }

  // Vérifier si le service de chat est disponible
  static async isAvailable(): Promise<boolean> {
    return N8nService.healthCheck();
  }
}
