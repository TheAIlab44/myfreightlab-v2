import { N8nService } from '../api/services/n8nService';
import type { FileItem } from '../api/services/n8nService';

// Service de fichiers qui utilise n8n pour la logique métier
export type { FileItem } from '../api/services/n8nService';

export interface FilesResponse {
  success: boolean;
  files?: FileItem[];
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  file?: FileItem;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

export class FilesService {
  // Récupérer la liste des fichiers
  static async getFiles(): Promise<FilesResponse> {
    try {
      const result = await N8nService.getFiles();
      return {
        success: result.success,
        files: result.files,
        error: result.error
      };
    } catch (error) {
      console.error('Files service getFiles error:', error);
      return {
        success: false,
        error: 'Erreur interne du service de fichiers'
      };
    }
  }

  // Uploader un fichier
  static async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const result = await N8nService.uploadFile(file);
      return {
        success: result.success,
        file: result.file,
        error: result.error
      };
    } catch (error) {
      console.error('Files service uploadFile error:', error);
      return {
        success: false,
        error: 'Erreur interne du service de fichiers'
      };
    }
  }

  // Supprimer un fichier
  static async deleteFile(filename: string): Promise<DeleteResponse> {
    try {
      const result = await N8nService.deleteFile(filename);
      return {
        success: result.success,
        error: result.error
      };
    } catch (error) {
      console.error('Files service deleteFile error:', error);
      return {
        success: false,
        error: 'Erreur interne du service de fichiers'
      };
    }
  }

  // Formater la taille du fichier
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obtenir l'icône selon le type MIME
  static getFileIcon(mimetype: string): string {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.startsWith('text/')) return '📝';
    if (mimetype.includes('word')) return '📄';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    return '📎';
  }
}
