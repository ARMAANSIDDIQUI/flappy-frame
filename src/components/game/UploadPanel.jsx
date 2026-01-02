"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';

export function UploadPanel({ onImageSelect, selectedImage }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a PNG or JPG image only');
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setPreview(dataUrl);
        onImageSelect(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div className="w-full max-w-xs">
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-40 rounded-2xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${isDragActive 
            ? 'border-amber-400 bg-amber-400/10' 
            : 'border-stone-600 hover:border-amber-500/50 bg-stone-900/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shadow-amber-400/20">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 transition-colors"
            >
              <FiX className="w-3 h-3 text-stone-400" />
            </button>
          </div>
        ) : (
          <>
            <FiUpload className={`w-8 h-8 mb-2 transition-colors ${isDragActive ? 'text-amber-400' : 'text-stone-500'}`} />
            <p className="text-sm text-stone-400 text-center px-4">
              {isDragActive ? 'Drop your image here' : 'Drop an image or click to upload'}
            </p>
            <p className="text-xs text-stone-600 mt-1">PNG, JPG up to 5MB</p>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
