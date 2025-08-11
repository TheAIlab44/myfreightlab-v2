import React, { useState, useEffect, useRef } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { getFilesApi, deleteFileApi } from '../api';
import type { FileItem } from '../services/filesService';
import './FilesPanel.css';

interface FilesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilesPanel: React.FC<FilesPanelProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Charger les fichiers au montage et à l'ouverture
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  // Gestion du clic outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await getFilesApi();
      
      if (result.success && result.files) {
        setFiles(result.files);
      } else {
        setError(result.error || 'Erreur lors du chargement des fichiers');
      }
    } catch (err) {
      setError('Erreur lors du chargement des fichiers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    // Recharger la liste complète des fichiers pour être sûr d'avoir la version la plus à jour
    loadFiles();
    setError('');
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      const result = await deleteFileApi(filename);
      
      if (result.success) {
        // Recharger la liste complète des fichiers pour être sûr d'être sync avec le serveur
        loadFiles();
        setError('');
      } else {
        setError(result.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression du fichier');
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="files-panel-overlay" />}
      
      {/* Panel */}
      <div
        ref={panelRef}
        className={`files-panel ${isOpen ? 'open' : ''}`}
      >
        <div className="files-panel-header">
          <h3>📁 Mes fichiers</h3>
          <button 
            onClick={onClose}
            className="close-button"
            title="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="files-panel-content">
          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="error-close">✕</button>
            </div>
          )}

          <div className="upload-section">
            <h4>📤 Upload</h4>
            <FileUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          <div className="files-section">
            <div className="files-header">
              <h4>📋 Fichiers ({files.length})</h4>
              <button 
                onClick={loadFiles}
                className="refresh-button"
                disabled={isLoading}
                title="Actualiser"
              >
                🔄
              </button>
            </div>
            
            <FileList 
              files={files}
              onDeleteFile={handleDeleteFile}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FilesPanel;
