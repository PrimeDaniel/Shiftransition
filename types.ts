export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export type AppStatus = 'IDLE' | 'ANALYZING' | 'GENERATING' | 'COMPLETE' | 'ERROR';

export type AspectRatio = '16:9' | '9:16';

export interface GenerationResult {
  videoUrl: string | null;
  promptUsed: string | null;
  error?: string;
}