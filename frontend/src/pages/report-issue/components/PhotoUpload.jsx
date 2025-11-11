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
    <div className="bg-card rounded-lg border border-border p-6 civic-shadow-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
          <Icon name="Camera" size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Photo Evidence</h2>
          <p className="text-sm text-text-secondary">Upload photos to help illustrate the issue</p>
        </div>
      </div>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center civic-transition ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
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
        
        <div className="space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto">
            <Icon name="Upload" size={24} className="text-text-secondary" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Drop photos here or click to browse
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Support for JPG, PNG, GIF up to 10MB each. Maximum {maxFiles} photos.
            </p>
            
            <Button
              variant="outline"
              onClick={openFileDialog}
              iconName="Plus"
              iconPosition="left"
            >
              Select Photos
            </Button>
          </div>
        </div>
      </div>
      {/* Photo Previews */}
      {photos?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Uploaded Photos ({photos?.length}/{maxFiles})
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos?.map((photo) => (
              <div key={photo?.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={photo?.url}
                    alt={`Issue photo showing ${photo?.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <button
                  onClick={() => removePhoto(photo?.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 civic-transition hover:scale-110"
                >
                  <Icon name="X" size={14} />
                </button>
                
                <div className="mt-2">
                  <p className="text-xs text-text-secondary truncate" title={photo?.name}>
                    {photo?.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {formatFileSize(photo?.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Tips */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
          <Icon name="Lightbulb" size={16} className="mr-2 text-warning" />
          Photo Tips
        </h4>
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• Take clear, well-lit photos from multiple angles</li>
          <li>• Include context showing the surrounding area</li>
          <li>• Capture any safety hazards or damage clearly</li>
          <li>• Avoid including personal information in photos</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUpload;