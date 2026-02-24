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
    <div className="space-y-3">
      {/* Main Upload Zone - fully clickable */}
      {photos?.length === 0 ? (
        <div
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-3 py-3 px-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              dragActive ? 'bg-primary/20' : 'bg-primary/10'
            }`}>
              <Icon name="Camera" size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {dragActive ? 'Drop photos here' : 'Click to add photos'}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Drag & drop or click to browse · JPG, PNG, WEBP · Up to {maxFiles} photos · 10MB each
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Icon name="Upload" size={14} className="text-primary" />
              <span className="text-xs font-medium text-primary">Browse</span>
            </div>
          </div>
        </div>
      ) : (
        /* Photo grid with add-more tile */
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">
              Photos <span className="text-text-secondary font-normal">({photos?.length}/{maxFiles})</span>
            </p>
            {photos?.length < maxFiles && (
              <button
                type="button"
                onClick={openFileDialog}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 civic-transition"
              >
                <Icon name="Plus" size={14} />
                Add more
              </button>
            )}
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 rounded-xl border-2 border-dashed transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
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
                  type="button"
                  onClick={() => removePhoto(photo?.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm"
                >
                  <Icon name="X" size={11} />
                </button>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
              </div>
            ))}
            {/* Add more tile inline */}
            {photos?.length < maxFiles && (
              <button
                type="button"
                onClick={openFileDialog}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-primary transition-all"
              >
                <Icon name="Plus" size={20} />
                <span className="text-[10px] font-medium">Add</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
