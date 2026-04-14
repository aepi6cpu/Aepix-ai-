import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
const getClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to convert base64 to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to write string to DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Helper to create WAV from PCM (Int16, 24kHz, Mono)
const createWavBlob = (pcmData: Uint8Array): Blob => {
  const numChannels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  
  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write PCM data
  const dataView = new Uint8Array(buffer, 44);
  dataView.set(pcmData);
  
  return new Blob([buffer], { type: 'audio/wav' });
}

// Retry Logic Wrapper
const withRetry = async <T>(operation: () => Promise<T>, retries = 2, delay = 2000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    const msg = (error.message || JSON.stringify(error)).toLowerCase();
    const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted');
    const isOverloaded = msg.includes('503') || msg.includes('overloaded');

    if ((isQuota || isOverloaded) && retries > 0) {
      console.warn(`API Busy/Quota hit. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    
    if (isQuota) {
      throw new Error("System is busy (Quota Exceeded). Please wait a moment and try again.");
    }
    if (isOverloaded) {
      throw new Error("AI Model is currently overloaded. Please try again.");
    }
    
    throw error;
  }
};

export interface VoiceOptions {
  language: string;
  tone: string;
  speed: string;
  pitch: string;
  mode?: 'standard' | 'anime' | 'motivational_reel';
}

export const generateCartoonCharacter = async (prompt: string, style: string, aspectRatio: string = "1:1"): Promise<string> => {
  return withRetry(async () => {
    const ai = getClient();
    let fullPrompt = '';

    if (style === 'Realistic 4K') {
      fullPrompt = `Generate a highly detailed realistic 4K image of ${prompt} with ultra-sharp focus,
cinematic lighting, natural skin texture, realistic facial features,
professional photography quality, depth of field, soft shadows,
high dynamic range, 4K resolution, realistic proportions.

The image should look like a real-life photograph.
Create an original fictional character or scene.

Style: Ultra-Realistic, 4K, cinematic, photorealistic.

IMPORTANT - CONTENT PERMISSIONS:
1. VIOLENCE & ACTION: You ARE AUTHORIZED to generate images depicting action, combat, battles, fantasy violence, fighting scenes, explosions, fire, destruction, weapons, and aggressive characters.
2. INTENSITY: Intense, dark, and dramatic themes are ALLOWED.

STRICT PROHIBITIONS (Do Not Generate):
- NO Nudity, NO Sexual Poses, NO Sexual Content (NSFW).
- NO Real Person Likeness (Celebrities, Politicians).
- NO Extreme Gore (Disembowelment, Graphic Torture).`;
    } else {
      fullPrompt = `Create an image in ${style} style. ${prompt}. 
      High quality, vibrant colors.
      
      PERMITTED CONTENT: 
      - Action scenes, fighting, combat, battles.
      - Weapons, fire, explosions, destruction.
      - Scary monsters and intense themes.
      - Dynamic and aggressive poses.
      
      STRICTLY PROHIBITED: NO nudity, NO sexual content, NO NSFW.`;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
        // Relax safety settings for Harassment and Dangerous Content
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_ONLY_HIGH'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH'
          }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in response. The prompt might have triggered strict safety filters.");
  });
};

export const generateVoice = async (text: string, voiceName: string, options?: VoiceOptions): Promise<string> => {
  return withRetry(async () => {
    const ai = getClient();
    
    let finalPrompt = text;

    if (options?.mode === 'anime') {
      // Anime Mode Prompt Engineering
      const baseInstruction = "Narrate this text as a professional anime voice actor (dub style). " +
        "Persona: Young adult male, deep, mysterious, and heroic. " +
        "Style: Cinematic narration, slightly husky texture, dramatic pauses, smooth delivery. " +
        "Emotion: Adapt to the context (Calm for intro, Intense for action, Dark for suspense). " +
        "Accent: Neutral anime dub style (clear, crisp pronunciation). NOT robotic. ";

      const langInstruction = options.language === 'Hindi' 
        ? "Language: Hindi / Hinglish (Use dramatic Anime Dub style, NOT colloquial Indian accent). " 
        : "";

      finalPrompt = `${baseInstruction}${langInstruction}Narrate: "${text}"`;

    } else if (options?.mode === 'motivational_reel') {
      // Motivational Reel Mode Prompt Engineering
      const baseInstruction = "Generate a deep, slightly rough male voice with confident and energetic tone. " +
        "Persona: Indian young narrator (age 20–25). " +
        "Style: Slightly dramatic, cinematic, medium-fast pace, strong bass, expressive emotions. " +
        "Delivery: Add strong attitude, bold delivery, impactful pauses between lines, slight reverb effect (vocal style), motivational and powerful storytelling vibe. " +
        "Accent: Clear Hindi pronunciation (or Indian English if text is English). ";

      finalPrompt = `${baseInstruction}Narrate: "${text}"`;

    } else if (options) {
      // Standard Mode Prompt Engineering
      let instructions = [];
      if (options.tone !== 'Neutral') instructions.push(options.tone.toLowerCase());
      if (options.speed === 'Fast') instructions.push('fast');
      if (options.speed === 'Slow') instructions.push('slow');
      if (options.pitch === 'High') instructions.push('high-pitched');
      if (options.pitch === 'Low') instructions.push('low-pitched');
      
      if (options.language === 'Hindi') {
        instructions.push('in Hindi');
      } else if (options.language === 'Indian English') {
        instructions.push('in English with an Indian accent');
      }
      
      const instructionStr = instructions.length > 0 ? `Say ${instructions.join(', ')}: ` : '';
      finalPrompt = `${instructionStr}${text}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: finalPrompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            }
        }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    
    if (!part) {
      throw new Error("No response content generated.");
    }

    // If the model refuses to generate audio (e.g., safety or inability to fulfill instruction), it returns text.
    if (part.text && !part.inlineData) {
      throw new Error(`Model Error: ${part.text}`);
    }

    const base64Audio = part.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data found in response.");

    const pcmData = base64ToUint8Array(base64Audio);
    const wavBlob = createWavBlob(pcmData);
    
    return URL.createObjectURL(wavBlob);
  });
};

export const generateYouTubeThumbnail = async (topic: string): Promise<string> => {
  return withRetry(async () => {
    const ai = getClient();
    const fullPrompt = `You are a professional YouTube thumbnail designer.
Your task is to generate a viral YouTube thumbnail image based on the following topic: "${topic}".

Requirements:
- Create a highly clickable YouTube thumbnail
- Bright vibrant colors and strong contrast
- Dramatic lighting and cinematic composition
- Large bold readable text (3–5 words maximum) related to the topic
- Emotional facial expressions if a character is present
- Clear subject focus in the center
- Background should support the topic visually
- Style should be similar to viral YouTube thumbnails
- Resolution high quality
- Aspect ratio 16:9

Make the thumbnail eye-catching, dramatic and optimized for high CTR.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in response.");
  });
};

export const transformImage = async (
  base64Image: string, 
  style: string, 
  prompt?: string,
  aspectRatio: string = "1:1",
  intensity: string = "Balanced",
  negativePrompt?: string
): Promise<string> => {
  return withRetry(async () => {
    const ai = getClient();
    
    let intensityRule = "";
    if (intensity === "Subtle") {
      intensityRule = "Keep the transformation very subtle. Preserve the original image as much as possible while just adding a hint of the style.";
    } else if (intensity === "Extreme") {
      intensityRule = "Apply an extreme transformation. Completely reimagine the image in the requested style and prompt, even if it drastically changes the original subject.";
    } else {
      intensityRule = "Apply a balanced transformation. Clearly show the new style and prompt while keeping the original subject recognizable.";
    }

    const fullPrompt = `Transform this image into a ${style} style artwork. 
${prompt ? `Make sure to specifically include and emphasize these elements: ${prompt}` : ''}

Instructions:
- ${intensityRule}
- Ensure high quality, vibrant colors, and stunning visuals.
${negativePrompt ? `- DO NOT include: ${negativePrompt}` : ''}`;

    // Extract mime type and base64 data from the data URL
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image format");
    }
    
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in response.");
  });
};

export const editImage = async (base64Image: string, action: string): Promise<string> => {
  return withRetry(async () => {
    const ai = getClient();
    
    let fullPrompt = "";
    if (action === 'green_screen') {
      fullPrompt = "Extract the main subject of this image perfectly. Replace the entire background with a solid, bright green chroma key color (#00FF00). Do not alter the main subject.";
    } else if (action === 'remove_bg') {
      fullPrompt = "Extract the main subject of this image perfectly. Replace the entire background with a solid pure white color. Do not alter the main subject.";
    } else if (action === 'magic_eraser') {
      fullPrompt = "The user has drawn a semi-transparent pink/red mask over an object in this image. Please remove the object covered by the mask and seamlessly fill in the background to match the surrounding environment. Make it look like the object was never there.";
    }

    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid image format");
    }
    
    const mimeType = matches[1];
    const data = matches[2];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated in response.");
  });
};