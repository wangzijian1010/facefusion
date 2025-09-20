
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  error?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-2xl text-center">
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-10 sm:p-20 transition-all duration-300 ${isDragging ? 'border-cyan-400 bg-slate-800/80' : 'border-slate-600 bg-slate-800/50'}`}
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <UploadIcon className="w-16 h-16 text-slate-400" />
                <p className="text-xl font-semibold">Drag & drop your image here</p>
                <p className="text-slate-400">or</p>
                <label htmlFor="file-upload" className="cursor-pointer bg-slate-700 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-600 transition-colors">
                    Browse Files
                </label>
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                />
                <p className="text-xs text-slate-500 pt-4">Supports JPG, PNG, WEBP. Max 10MB.</p>
            </div>
        </div>
        {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
};

export default ImageUploader;
