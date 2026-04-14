import React, { useState } from 'react';
import { GenerationType } from '../types';
import { Sparkles, Copy, Check, Music, Image as ImageIcon, Video } from 'lucide-react';

interface ExampleItem {
  id: string;
  type: GenerationType;
  url: string; // Using Unsplash for demo visual representation
  prompt: string;
  style: string;
}

const EXAMPLES: ExampleItem[] = [
  {
    id: 'ex1',
    type: GenerationType.IMAGE,
    url: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1000&auto=format&fit=crop',
    prompt: 'A cute, friendly robot delivery bot with round eyes, shiny white plastic texture, holding a package, soft lighting',
    style: 'Pixar 3D'
  },
  {
    id: 'ex2',
    type: GenerationType.IMAGE,
    url: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=1000&auto=format&fit=crop',
    prompt: 'A cyberpunk samurai standing in neon rain, glowing katana, futuristic city background, high contrast',
    style: 'Anime / Manga'
  },
  {
    id: 'ex3',
    type: GenerationType.IMAGE,
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
    prompt: 'A highly detailed portrait of a wise old owl with glowing amber eyes, realistic feathers, forest background',
    style: 'Realistic 4K'
  },
  {
    id: 'ex4',
    type: GenerationType.AUDIO,
    url: '', // Audio examples don't have a visual preview, handled in UI
    prompt: 'Welcome to the future of storytelling. I can narrate your adventures with clarity and emotion.',
    style: 'Fenrir (Male)'
  }
];

export const InspirationGallery: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-yellow-500" size={24} />
        <h3 className="text-2xl font-fredoka font-semibold text-slate-800">Get Inspired</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXAMPLES.map((item) => (
          <div 
            key={item.id} 
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-row h-40 group"
          >
            {/* Media Preview Section */}
            <div className="w-1/3 relative bg-slate-100 shrink-0">
              {item.type === GenerationType.IMAGE || item.type === GenerationType.VIDEO ? (
                <img 
                  src={item.url} 
                  alt={item.style} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Music className="text-white" size={32} />
                </div>
              )}
              
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                {item.type === GenerationType.IMAGE ? <ImageIcon size={10} /> : item.type === GenerationType.VIDEO ? <Video size={10} /> : <Music size={10} />}
                {item.style}
              </div>
            </div>

            {/* Content Section */}
            <div className="w-2/3 p-4 flex flex-col justify-between relative">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Prompt</p>
                <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed italic">
                  "{item.prompt}"
                </p>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => handleCopy(item.prompt, item.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                    ${copiedId === item.id 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}
                  `}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check size={14} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};