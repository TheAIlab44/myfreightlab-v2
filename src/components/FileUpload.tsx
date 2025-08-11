import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { uploadFileApi } from '../api';
import './FileUpload.css';

interface FileUploadProps {
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const result = await uploadFileApi(file);
      
      if (result.success && result.file) {
        onUploadSuccess();
      } else {
        onUploadError(result.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      onUploadError('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="*/*"
        />
        
        {isUploading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <span>Upload en cours...</span>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <p><strong>Glissez-déposez un fichier ici</strong></p>
              <p>ou cliquez pour sélectionner</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
