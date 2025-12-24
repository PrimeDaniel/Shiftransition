import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { ImageFile, AspectRatio } from '../types';
import { processImage } from '../utils/imageUtils';

interface DropZoneProps {
  label: string;
  image: ImageFile | null;
  onImageSelect: (file: ImageFile | null) => void;
  disabled?: boolean;
  aspectRatio: AspectRatio;
  onError?: (error: string | null) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  label, 
  image, 
  onImageSelect, 
  disabled,
  aspectRatio,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileProcess = useCallback(
    async (file: File) => {
      if (disabled) return;
      
      setIsProcessing(true);
      try {
        const processed = await processImage(file, aspectRatio);
        onImageSelect(processed);
        if (onError) onError(null); // Clear any previous errors
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to process image';
        if (onError) {
          onError(errorMessage);
        }
        console.error('Image processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [disabled, aspectRatio, onImageSelect, onError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileProcess(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFileProcess]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled || isProcessing) return;
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleFileProcess(file);
      }
    },
    [disabled, isProcessing, handleFileProcess]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (image) {
    return (
      <div className="relative group w-full h-64 rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-lg transition-transform transform hover:scale-[1.01]">
        <img
          src={image.previewUrl}
          alt={label}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onImageSelect(null)}
            disabled={disabled || isProcessing}
            className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-xs text-white backdrop-blur-md">
          {label}
        </div>
        <div className="absolute top-3 right-3 bg-blue-500/90 px-2 py-1 rounded-md text-[10px] text-white font-black uppercase tracking-wider backdrop-blur-sm">
          {aspectRatio}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative ${
        disabled || isProcessing
          ? 'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
          : 'border-slate-600 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800 cursor-pointer'
      }`}
    >
      {isProcessing && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
          <Loader2 size={32} className="text-blue-400 animate-spin mb-3" />
          <p className="text-sm text-slate-300 font-medium">Processing...</p>
          <p className="text-xs text-slate-500 mt-1">Resizing to {aspectRatio}</p>
        </div>
      )}
      <label className={`flex flex-col items-center justify-center w-full h-full ${(!disabled && !isProcessing) ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
        <div className={`p-4 rounded-full bg-slate-800 mb-4 ${isProcessing ? 'text-slate-600' : 'text-blue-400'}`}>
          {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
        </div>
        <p className="text-slate-300 font-medium mb-1">{label}</p>
        <p className="text-slate-500 text-sm">Drag & Drop or Click to Upload</p>
        <p className="text-slate-600 text-[10px] mt-2 font-medium uppercase tracking-wider">
          Auto-resized to {aspectRatio}
        </p>
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isProcessing}
        />
      </label>
    </div>
  );
};