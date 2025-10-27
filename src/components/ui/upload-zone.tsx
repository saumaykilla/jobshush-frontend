import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '../ui/button';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  disabled?: boolean;
  allowReplace?: boolean; // Allow replacing an already uploaded file
  resetTrigger?: boolean; // External trigger to reset the component
}

export function UploadZone({ 
  onFileUpload, 
  acceptedTypes = ".pdf,.doc,.docx",
  maxSize = 10,
  placeholder = "Drop your resume here or click to upload",
  disabled = false,
  allowReplace = true,
  resetTrigger = false
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset when external trigger changes
  useEffect(() => {
    if (resetTrigger) {
      setUploadedFile(null);
      setError(null);
      setIsDragOver(false);
    }
  }, [resetTrigger]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    const allowedExtensions = acceptedTypes.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return `File type must be: ${acceptedTypes}`;
    }
    
    return null;
  }, [maxSize, acceptedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setError(null);
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [disabled, validateFile, onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setError(null);
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [validateFile, onFileUpload]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
      input?.click();
    }
  }, []);

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={placeholder}
          aria-describedby="upload-instructions"
        >
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload file"
          />
          
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-sm">{placeholder}</p>
              <p id="upload-instructions" className="text-xs text-muted-foreground mt-1">
                Supported formats: {acceptedTypes} (max {maxSize}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
            <FileText className="w-5 h-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{uploadedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0"
              aria-label="Remove uploaded file"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {allowReplace && (
            <div
              className={`
                relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
                ${isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label="Upload a different file"
            >
              <input
                type="file"
                accept={acceptedTypes}
                onChange={handleFileSelect}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Upload a different file"
              />
              
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Drop a different file or click to replace
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive mt-2" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}