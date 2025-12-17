export interface ImageFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export type AppStatus = 'IDLE' | 'ANALYZING' | 'GENERATING' | 'COMPLETE' | 'ERROR';

export type AspectRatio = '16:9' | '9:16';

export type TransitionStyleId = 'MORPH' | 'WHIP_PAN' | 'VERTIGO' | 'SUBJECT_FLOW' | 'VORTEX' | 'DISSOLVE';

export interface TransitionStyle {
  id: TransitionStyleId;
  name: string;
  description: string;
  icon: string;
}

export interface GenerationResult {
  videoUrl: string | null;
  promptUsed: string | null;
  error?: string;
}