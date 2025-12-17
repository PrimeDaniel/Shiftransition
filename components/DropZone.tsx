import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '../types';

interface DropZoneProps {
  label: string;
  image: ImageFile | null;
  onImageSelect: (file: ImageFile | null) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ label, image, onImageSelect, disabled }) => {
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageSelect({
            file,
            previewUrl: URL.createObjectURL(file),
            base64: reader.result as string,
            mimeType: file.type,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageSelect({
            file,
            previewUrl: URL.createObjectURL(file),
            base64: reader.result as string,
            mimeType: file.type,
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [disabled, onImageSelect]
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
            disabled={disabled}
            className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-md text-xs text-white backdrop-blur-md">
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
        disabled
          ? 'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
          : 'border-slate-600 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800'
      }`}
    >
      <label className={`flex flex-col items-center justify-center w-full h-full ${!disabled && 'cursor-pointer'}`}>
        <div className="p-4 rounded-full bg-slate-800 mb-4 text-blue-400">
          <Upload size={32} />
        </div>
        <p className="text-slate-300 font-medium mb-1">{label}</p>
        <p className="text-slate-500 text-sm">Drag & Drop or Click to Upload</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};