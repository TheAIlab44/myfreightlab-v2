// Configuration et service pour n8n
const n8nBaseUrl = import.meta.env.VITE_N8N_BASE_URL;

if (!n8nBaseUrl) {
  throw new Error(
    'Missing n8n environment variable. Please check VITE_N8N_BASE_URL in your .env file.'
  );
}

const N8N_CONFIG = {
  webhookUrl: `${n8nBaseUrl}/chat-message`,
  filesUrl: `${n8nBaseUrl}`
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

// Types pour les fichiers
export interface FileItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export interface N8nFilesResponse {
  success: boolean;
  files?: FileItem[];
  error?: string;
}

export interface N8nUploadResponse {
  success: boolean;
  file?: FileItem;
  error?: string;
}

export interface N8nDeleteResponse {
  success: boolean;
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

  // Récupérer la liste des fichiers
  static async getFiles(): Promise<N8nFilesResponse> {
    try {
      const response = await fetch(`${N8N_CONFIG.filesUrl}/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Vérifier si la réponse a du contenu
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        console.warn('N8n getFiles: Empty response');
        return {
          success: true,
          files: []
        };
      }

      // Lire le texte brut d'abord pour débugger
      const responseText = await response.text();
      console.log('N8n getFiles response:', responseText);

      // Vérifier si c'est du JSON valide
      if (!responseText.trim()) {
        console.warn('N8n getFiles: Empty response body');
        return {
          success: true,
          files: []
        };
      }

      let files;
      try {
        files = JSON.parse(responseText);
      } catch (parseError) {
        console.error('N8n getFiles: Invalid JSON response:', responseText);
        throw new Error('Réponse invalide du serveur (JSON malformé)');
      }
      
      return {
        success: true,
        files: Array.isArray(files) ? files.filter(file => 
          file && 
          file.id && 
          file.metadata && 
          typeof file.metadata === 'object'
        ) : []
      };
    } catch (error) {
      console.error('N8n getFiles error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération des fichiers'
      };
    }
  }

  // Uploader un fichier
  static async uploadFile(file: File): Promise<N8nUploadResponse> {
    try {
      // Utiliser FormData pour envoyer le fichier avec ses métadonnées
      const formData = new FormData();
      formData.append('file', file, file.name);

      const response = await fetch(`${N8N_CONFIG.filesUrl}/files`, {
        method: 'POST',
        body: formData, // Envoyer FormData au lieu du File directement
      });

      // Gestion spécifique des erreurs HTTP
      if (response.status === 409) {
        // Fichier déjà existant
        try {
          const errorText = await response.text();
          console.log(`N8n uploadFile ${response.status} error:`, errorText);
          return {
            success: false,
            error: `Le fichier "${file.name}" existe déjà. Veuillez le renommer ou supprimer l'ancien fichier.`
          };
        } catch (parseError) {
          return {
            success: false,
            error: `Le fichier "${file.name}" existe déjà.`
          };
        }
      }

      if (response.status === 415) {
        // Type de fichier non supporté
        try {
          const errorText = await response.text();
          console.log(`N8n uploadFile ${response.status} error:`, errorText);
          return {
            success: false,
            error: `Le type de fichier "${file.type || 'inconnu'}" n'est pas supporté. Veuillez utiliser un format de fichier autorisé.`
          };
        } catch (parseError) {
          return {
            success: false,
            error: `Type de fichier non supporté.`
          };
        }
      }

      if (response.status === 400) {
        // Erreur de validation générale
        try {
          const errorText = await response.text();
          console.log(`N8n uploadFile ${response.status} error:`, errorText);
            // Enlever le préfixe "400 -" s'il existe, sans toucher aux guillemets du JSON
            let jsonString = errorText.trim();
            if (jsonString.startsWith('400 -')) {
              jsonString = jsonString.slice('400 -'.length);
            }
            const errorData = JSON.parse(JSON.parse(jsonString));

          
          // Vérifier d'abord le statusCode dans le JSON (nouveau format)
          if (errorData.statusCode === 409) {
            return {
              success: false,
              error: `Le fichier "${file.name}" existe déjà. Veuillez le renommer ou supprimer l'ancien fichier.`
            };
          }
          
          if (errorData.statusCode === 415) {
            return {
              success: false,
              error: `Le type de fichier "${file.type || 'inconnu'}" n'est pas supporté. Veuillez utiliser un format de fichier autorisé.`
            };
          }
          
          // Fallback sur l'ancien format pour compatibilité
          if (errorData.error === "Duplicate") {
            return {
              success: false,
              error: `Le fichier "${file.name}" existe déjà. Veuillez le renommer ou supprimer l'ancien fichier.`
            };
          }
          
          if (errorData.error === "invalid_mime_type") {
            return {
              success: false,
              error: `Le type de fichier "${file.type || 'inconnu'}" n'est pas supporté. Veuillez utiliser un format de fichier autorisé.`
            };
          }
          
          // Autres erreurs 400
          return {
            success: false,
            error: errorData.message || errorData.error || 'Erreur de validation du fichier'
          };
        } catch (parseError) {
          return {
            success: false,
            error: 'Erreur de validation du fichier'
          };
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Lire le texte brut d'abord pour débugger
      const responseText = await response.text();
      console.log('N8n uploadFile response:', responseText);

      // Vérifier si c'est du JSON valide
      if (!responseText.trim()) {
        throw new Error('Réponse vide du serveur');
      }

      let uploadedFile;
      try {
        uploadedFile = JSON.parse(responseText);
      } catch (parseError) {
        console.error('N8n uploadFile: Invalid JSON response:', responseText);
        throw new Error('Réponse invalide du serveur (JSON malformé)');
      }
      
      return {
        success: true,
        file: uploadedFile
      };
    } catch (error) {
      console.error('N8n uploadFile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload du fichier'
      };
    }
  }

  // Supprimer un fichier
  static async deleteFile(filename: string): Promise<N8nDeleteResponse> {
    try {
      const response = await fetch(`${N8N_CONFIG.filesUrl}/files`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Pour les DELETE, la réponse peut être vide, c'est normal
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0' || !contentLength) {
        return {
          success: true
        };
      }

      // Si il y a du contenu, essayons de le parser
      const responseText = await response.text();
      console.log('N8n deleteFile response:', responseText);

      if (responseText.trim()) {
        try {
          const result = JSON.parse(responseText);
          return {
            success: true,
            ...result
          };
        } catch (parseError) {
          console.warn('N8n deleteFile: Non-JSON response, but status OK');
        }
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('N8n deleteFile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression du fichier'
      };
    }
  }
}
