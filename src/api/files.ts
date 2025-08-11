import { FilesService } from '../services/filesService';
import type { FileItem } from '../services/filesService';

// API de fichiers - utilisée uniquement par les composants/pages
export interface FilesApiResponse {
  success: boolean;
  files?: FileItem[];
  error?: string;
}

export interface UploadApiResponse {
  success: boolean;
  file?: FileItem;
  error?: string;
}

export interface DeleteApiResponse {
  success: boolean;
  error?: string;
}

// Récupérer la liste des fichiers
export const getFilesApi = async (): Promise<FilesApiResponse> => {
  try {
    const result = await FilesService.getFiles();
    return {
      success: result.success,
      files: result.files,
      error: result.error
    };
  } catch (error) {
    console.error('Get files API error:', error);
    return {
      success: false,
      error: 'Erreur de l\'API de fichiers'
    };
  }
};

// Uploader un fichier
export const uploadFileApi = async (file: File): Promise<UploadApiResponse> => {
  try {
    const result = await FilesService.uploadFile(file);
    return {
      success: result.success,
      file: result.file,
      error: result.error
    };
  } catch (error) {
    console.error('Upload file API error:', error);
    return {
      success: false,
      error: 'Erreur de l\'API d\'upload'
    };
  }
};

// Supprimer un fichier
export const deleteFileApi = async (filename: string): Promise<DeleteApiResponse> => {
  try {
    const result = await FilesService.deleteFile(filename);
    return {
      success: result.success,
      error: result.error
    };
  } catch (error) {
    console.error('Delete file API error:', error);
    return {
      success: false,
      error: 'Erreur de l\'API de suppression'
    };
  }
};
