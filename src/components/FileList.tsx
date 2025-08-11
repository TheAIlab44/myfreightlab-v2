import React from 'react';
import { FilesService } from '../services/filesService';
import type { FileItem } from '../services/filesService';
import './FileList.css';

interface FileListProps {
  files: FileItem[];
  onDeleteFile: (filename: string) => void;
  isLoading?: boolean;
}

const FileList: React.FC<FileListProps> = ({ files, onDeleteFile, isLoading = false }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (fileName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${fileName}" ?`)) {
      onDeleteFile(fileName);
    }
  };

  if (isLoading) {
    return (
      <div className="file-list-loading">
        <div className="spinner"></div>
        <span>Chargement des fichiers...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list-empty">
        <div className="empty-icon">📂</div>
        <p>Aucun fichier disponible</p>
        <span>Uploadez votre premier fichier ci-dessus</span>
      </div>
    );
  }

  return (
    <div className="file-list">
      {files.filter(file => file.id && file.metadata).map((file) => (
        <div key={file.id} className="file-item">
          <div className="file-icon">
            {FilesService.getFileIcon(file.metadata.mimetype)}
          </div>
          
          <div className="file-info">
            <div className="file-name" title={file.name}>
              {file.name}
            </div>
            <div className="file-details">
              <span className="file-size">
                {FilesService.formatFileSize(file.metadata.size)}
              </span>
              <span className="file-date">
                {formatDate(file.updated_at)}
              </span>
            </div>
          </div>
          
          <div className="file-actions">
            <button
              onClick={() => handleDelete(file.name)}
              className="delete-button"
              title="Supprimer le fichier"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
