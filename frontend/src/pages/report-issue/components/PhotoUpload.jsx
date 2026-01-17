import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PhotoUpload = ({ photos, onPhotosChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const maxFiles = 5;
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files?.filter(file => {
      if (!file?.type?.startsWith('image/')) {
        alert('Please select only image files');
        return false;
      }
      if (file?.size > maxFileSize) {
        alert(`File ${file?.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    if (photos?.length + validFiles?.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} photos`);
      return;
    }

    const newPhotos = validFiles?.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file?.name,
      size: file?.size
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = photos?.filter(photo => photo?.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const openFileDialog = () => {
    fileInputRef?.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="space-y-2">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex items-center justify-center gap-3">
          <Icon name="Upload" size={20} className="text-text-secondary" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">Add photos</p>
            <p className="text-xs text-text-secondary">
              Drag here or <button onClick={openFileDialog} className="text-primary hover:underline">browse</button> • Max {maxFiles} photos
            </p>
          </div>
        </div>
      </div>

      {/* Photo Previews - Compact Grid */}
      {photos?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-text-secondary">
              {photos?.length}/{maxFiles} photos
            </p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {photos?.map((photo) => (
              <div key={photo?.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={photo?.url}
                    alt={photo?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <button
                  onClick={() => removePhoto(photo?.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
