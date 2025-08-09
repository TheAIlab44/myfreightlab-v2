// Configuration et service pour n8n
const n8nBaseUrl = import.meta.env.VITE_N8N_BASE_URL;

if (!n8nBaseUrl) {
  throw new Error(
    'Missing n8n environment variable. Please check VITE_N8N_BASE_URL in your .env file.'
  );
}

const N8N_CONFIG = {
  webhookUrl: `${n8nBaseUrl}/chat-message`
};

// Types pour n8n
export interface N8nChatRequest {
  message: string;
  userId: string;
  userEmail: string;
  timestamp: string;
}

export interface N8nChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// Service n8n pour l'envoi de messages
export class N8nService {
  // Envoyer un message au webhook n8n
  static async sendMessage(
    message: string, 
    userId: string, 
    userEmail: string
  ): Promise<N8nChatResponse> {
    try {
      const payload: N8nChatRequest = {
        message,
        userId,
        userEmail,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(N8N_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Vérifier si la réponse contient output
      if (data.output) {
        return {
          success: true,
          response: data.output
        };
      } else {
        // Pas de contenu dans output
        return {
          success: false,
          error: 'Aucune réponse reçue du serveur ou impossible de parser le message de réponse'
        };
      }
    } catch (error) {
      console.error('N8n service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de communication avec n8n'
      };
    }
  }

  // Vérifier la disponibilité du service n8n
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(N8N_CONFIG.webhookUrl, {
        method: 'HEAD'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
