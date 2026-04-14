export enum GenerationType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface GeneratedItem {
  id: string;
  type: GenerationType;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  createdAt: number;
  voice?: string;
  tone?: string;
  speed?: string;
  pitch?: string;
  mode?: string;
}

export interface GenerationState {
  isGenerating: boolean;
  progress?: string;
  error?: string;
}

declare global {
  interface Window {
    // Kept empty or basic window extensions if needed in future
  }
}