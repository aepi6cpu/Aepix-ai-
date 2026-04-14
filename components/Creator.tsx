import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Sparkles, Download, AlertCircle, Ratio, Square, Smartphone, Monitor, Mic, Music, Sliders, Languages, Zap, Youtube, Upload, Scissors, Eraser, Paintbrush, Wand2, X, Video } from 'lucide-react';
import { GenerationType, GeneratedItem } from '../types';
import { generateCartoonCharacter, generateVoice, generateYouTubeThumbnail, transformImage, editImage } from '../services/geminiService';
import { Button } from './Button';

interface CreatorProps {
  onGenerate: (item: GeneratedItem) => void;
  credits: number;
  onDeductCredits: (amount: number) => void;
  onOpenPurchase: () => void;
}

const STYLES = [
  "Classic Disney",
  "Anime / Manga",
  "Pixar 3D",
  "Flat Design",
  "Retro 90s Cartoon",
  "Claymation",
  "Comic Book",
  "Realistic 4K",
  "Cyberpunk",
  "Steampunk",
  "Fantasy Art"
];

const RATIOS = [
  { label: "Square", value: "1:1", icon: <Square size={14} /> },
  { label: "Portrait", value: "3:4", icon: <Smartphone size={14} /> },
  { label: "Landscape", value: "4:3", icon: <Monitor size={14} /> },
  { label: "Cinema", value: "16:9", icon: <Monitor size={14} /> },
  { label: "Mobile", value: "9:16", icon: <Smartphone size={14} /> },
];

const VOICES = [
  { id: 'Puck', name: 'Puck (Male)' },
  { id: 'Charon', name: 'Charon (Male)' },
  { id: 'Kore', name: 'Kore (Female)' },
  { id: 'Fenrir', name: 'Fenrir (Male)' },
  { id: 'Zephyr', name: 'Zephyr (Female)' }
];

const LANGUAGES = [
  { id: 'English', name: 'English (US)' },
  { id: 'Indian English', name: 'English (Indian Accent)' },
  { id: 'Hindi', name: 'Hindi' }
];

const TONES = ['Neutral', 'Happy', 'Sad', 'Excited', 'Calm', 'Professional', 'Dramatic', 'Whispering'];
const SPEEDS = ['Slow', 'Normal', 'Fast'];
const PITCHES = ['Low', 'Normal', 'High'];

const TRANSFORM_STYLES = [
  "Ghibli Style",
  "Anime Style",
  "Cartoon Style",
  "Pixel Art",
  "3D Character",
  "Disney Style",
  "Cyberpunk",
  "Watercolor Painting",
  "Oil Painting",
  "Pencil Sketch",
  "Comic Book Style",
  "Clay Animation",
  "Lego Style",
  "Minecraft Style",
  "GTA Game Style",
  "Vintage 90s Photo",
  "Indian Comic Style"
];

export const Creator: React.FC<CreatorProps> = ({ onGenerate, credits, onDeductCredits, onOpenPurchase }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'thumbnail' | 'transform' | 'audio' | 'edit'>('image');
  
  // Image State
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedRatio, setSelectedRatio] = useState("1:1");

  // Transform State
  const [transformImageFile, setTransformImageFile] = useState<string | null>(null);
  const [transformImagePrompt, setTransformImagePrompt] = useState('');
  const [transformNegativePrompt, setTransformNegativePrompt] = useState('');
  const [selectedTransformStyle, setSelectedTransformStyle] = useState(TRANSFORM_STYLES[0]);
  const [selectedTransformRatio, setSelectedTransformRatio] = useState("1:1");
  const [selectedTransformIntensity, setSelectedTransformIntensity] = useState("Balanced");

  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Thumbnail State
  const [thumbnailTopic, setThumbnailTopic] = useState('');

  // Audio State
  const [audioScript, setAudioScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0].id);
  const [selectedTone, setSelectedTone] = useState(TONES[0]);
  const [selectedSpeed, setSelectedSpeed] = useState(SPEEDS[1]);
  const [selectedPitch, setSelectedPitch] = useState(PITCHES[1]);
  const [voiceMode, setVoiceMode] = useState<'standard' | 'anime' | 'motivational_reel'>('standard');

  // General State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GeneratedItem | null>(null);

  // Edit State
  const [editImageFile, setEditImageFile] = useState<string | null>(null);
  const [editAction, setEditAction] = useState<'green_screen' | 'remove_bg'>('green_screen');
  const [drawMode, setDrawMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = drawMode === 'erase' ? 'rgba(255, 0, 128, 0.6)' : 'rgba(0,0,0,1)';
    ctx.lineWidth = brushSize * scaleX;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = drawMode === 'erase' ? 'source-over' : 'destination-out';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleModeChange = (mode: 'standard' | 'anime' | 'motivational_reel') => {
    setVoiceMode(mode);
    
    if (mode === 'anime') {
      // Set Anime Presets
      setSelectedVoice('Fenrir'); // Deep Male
      setSelectedTone('Dramatic');
      setSelectedPitch('Low');
      setSelectedSpeed('Normal');
    } else if (mode === 'motivational_reel') {
      // Set Motivational Reel Presets
      setSelectedVoice('Fenrir'); // Deep Male for "strong bass"
      setSelectedTone('Dramatic');
      setSelectedPitch('Low');
      setSelectedSpeed('Fast'); // "Medium-fast pace"
      setSelectedLanguage('Hindi'); // "Clear Hindi pronunciation"
    } else {
      // Reset to defaults
      setSelectedTone(TONES[0]);
      setSelectedPitch(PITCHES[1]);
      setSelectedSpeed(SPEEDS[1]);
    }
  };

  const handleGenerate = async () => {
    if (credits < 10) {
      onOpenPurchase();
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentResult(null);

    try {
      let newItem: GeneratedItem;

      if (activeTab === 'image') {
        if (!prompt.trim()) return;
        const url = await generateCartoonCharacter(prompt, selectedStyle, selectedRatio);
        newItem = {
          id: Date.now().toString(),
          type: GenerationType.IMAGE,
          url,
          prompt: prompt,
          style: selectedStyle,
          aspectRatio: selectedRatio,
          createdAt: Date.now()
        };
      } else if (activeTab === 'transform') {
        if (!transformImageFile) return;
        const url = await transformImage(
          transformImageFile, 
          selectedTransformStyle, 
          transformImagePrompt,
          selectedTransformRatio,
          selectedTransformIntensity,
          transformNegativePrompt
        );
        newItem = {
          id: Date.now().toString(),
          type: GenerationType.IMAGE,
          url,
          prompt: transformImagePrompt || 'No prompt provided',
          style: selectedTransformStyle,
          aspectRatio: selectedTransformRatio,
          createdAt: Date.now()
        };
      } else if (activeTab === 'edit') {
        if (!editImageFile) return;
        
        let finalImageToProcess = editImageFile;

        const url = await editImage(finalImageToProcess, editAction);
        newItem = {
            id: Date.now().toString(),
            type: GenerationType.IMAGE,
            url,
            prompt: editAction === 'green_screen' ? 'Green Screen Background' : 'Remove Background',
            style: 'AI Edit',
            aspectRatio: 'Original',
            createdAt: Date.now()
        };
      } else if (activeTab === 'thumbnail') {
        if (!thumbnailTopic.trim()) return;
        const url = await generateYouTubeThumbnail(thumbnailTopic);
        newItem = {
          id: Date.now().toString(),
          type: GenerationType.IMAGE,
          url,
          prompt: thumbnailTopic,
          style: "YouTube Thumbnail",
          aspectRatio: "16:9",
          createdAt: Date.now()
        };
      } else {
        if (!audioScript.trim()) return;
        
        const voiceOptions = {
          language: selectedLanguage,
          tone: selectedTone,
          speed: selectedSpeed,
          pitch: selectedPitch,
          mode: voiceMode
        };

        // For preset modes, we force specific voices to ensure consistency
        let targetVoice = selectedVoice;
        if (voiceMode === 'anime') targetVoice = 'Fenrir';
        if (voiceMode === 'motivational_reel') targetVoice = 'Fenrir';

        const url = await generateVoice(audioScript, targetVoice, voiceOptions as any);
        
        // Create a descriptive style string for history
        let styleSummary = '';
        if (voiceMode === 'anime') {
          styleSummary = "Anime Narrator Pack ✦";
        } else if (voiceMode === 'motivational_reel') {
          styleSummary = "Motivational Reel 🔥";
        } else {
          const toneStr = selectedTone !== 'Neutral' ? ` • ${selectedTone}` : '';
          const langStr = selectedLanguage !== 'English' ? ` • ${selectedLanguage}` : '';
          styleSummary = `${VOICES.find(v => v.id === targetVoice)?.name}${langStr}${toneStr}`;
        }

        newItem = {
          id: Date.now().toString(),
          type: GenerationType.AUDIO,
          url,
          prompt: audioScript,
          style: styleSummary,
          aspectRatio: '', 
          createdAt: Date.now(),
          voice: VOICES.find(v => v.id === targetVoice)?.name || targetVoice,
          tone: selectedTone,
          speed: selectedSpeed,
          pitch: selectedPitch,
          mode: voiceMode
        };
      }

      setCurrentResult(newItem);
      onGenerate(newItem);
      onDeductCredits(10); // Deduct 10 credits per generation

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getButtonIcon = () => {
    if (activeTab === 'image') return <Sparkles size={18} />;
    if (activeTab === 'transform') return <Sparkles size={18} />;
    if (activeTab === 'edit') return <Wand2 size={18} />;
    if (activeTab === 'thumbnail') return <Youtube size={18} />;
    return <Mic size={18} />;
  };

  const getButtonText = () => {
    if (activeTab === 'image') return 'Generate Character';
    if (activeTab === 'transform') return 'Transform Image';
    if (activeTab === 'edit') return 'Apply Edit';
    if (activeTab === 'thumbnail') return 'Generate Thumbnail';
    if (voiceMode === 'anime') return 'Generate Anime Voice';
    if (voiceMode === 'motivational_reel') return 'Generate Reel Voice';
    return 'Generate Voice';
  };

  const isButtonDisabled = () => {
    if (activeTab === 'image') return !prompt.trim();
    if (activeTab === 'transform') return !transformImageFile;
    if (activeTab === 'edit') return !editImageFile;
    if (activeTab === 'thumbnail') return !thumbnailTopic.trim();
    if (activeTab === 'audio') return !audioScript.trim();
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
      
      {/* Mode Switcher */}
      <div className="flex justify-center mb-2">
        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200/60 inline-flex shadow-inner flex-wrap justify-center gap-1 relative">
          {[
            { id: 'image', label: 'Character', icon: ImageIcon },
            { id: 'thumbnail', label: 'Thumbnail', icon: Youtube },
            { id: 'transform', label: 'Transform', icon: ImageIcon },
            { id: 'edit', label: 'Edit', icon: Wand2 },
            { id: 'audio', label: 'Voice AI', icon: Mic },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-colors z-10 ${
                  isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-full shadow-md -z-10 ${
                      tab.id === 'image' ? 'bg-indigo-600' :
                      tab.id === 'thumbnail' ? 'bg-red-600' :
                      tab.id === 'transform' ? 'bg-emerald-600' :
                      tab.id === 'edit' ? 'bg-blue-600' :
                      'bg-indigo-600'
                    }`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 border border-slate-200 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-indigo-100/50 transition-all duration-500 hover:shadow-indigo-200/50">
        <div className="flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
             <div className="flex items-center gap-3">
               <div className={`p-2.5 rounded-xl shadow-sm transition-all duration-500 ${
                 activeTab === 'image' ? 'bg-indigo-600 rotate-0' : 
                 activeTab === 'thumbnail' ? 'bg-red-600 rotate-0' :
                 activeTab === 'transform' ? 'bg-emerald-600 rotate-0' :
                 activeTab === 'edit' ? 'bg-blue-600 rotate-0' :
                 voiceMode === 'anime' ? 'bg-violet-600 rotate-12' : 
                 voiceMode === 'motivational_reel' ? 'bg-orange-600 -rotate-12' : 
                 'bg-indigo-600'
               }`}>
                  {activeTab === 'image' && <ImageIcon size={24} className="text-white" />}
                  {activeTab === 'thumbnail' && <Youtube size={24} className="text-white" />}
                  {activeTab === 'transform' && <ImageIcon size={24} className="text-white" />}
                  {activeTab === 'edit' && <Wand2 size={24} className="text-white" />}
                  {activeTab === 'audio' && <Mic size={24} className="text-white" />}
               </div>
               <div>
                 <h3 className="text-2xl font-fredoka font-bold text-slate-800 tracking-tight">
                   {activeTab === 'image' && 'Character Studio'}
                   {activeTab === 'thumbnail' && 'Thumbnail Studio'}
                   {activeTab === 'transform' && 'Image Transform'}
                   {activeTab === 'edit' && 'Edit Studio'}
                   {activeTab === 'audio' && (
                      voiceMode === 'anime' ? 'Anime Voice Studio' : 
                      voiceMode === 'motivational_reel' ? 'Reel Voice Studio' : 
                      'Voice Studio'
                   )}
                 </h3>
                 <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                   {activeTab === 'image' ? 'Visualize your imagination' : 
                    activeTab === 'thumbnail' ? 'Create viral thumbnails' :
                    activeTab === 'transform' ? 'Restyle your photos' :
                    activeTab === 'edit' ? 'Magic tools for photos' :
                    'Bring stories to life'}
                 </p>
               </div>
             </div>
             
             {activeTab === 'audio' && (
               <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 self-start md:self-auto relative">
                  {['standard', 'anime', 'motivational_reel'].map((mode) => (
                    <button 
                      key={mode}
                      onClick={() => handleModeChange(mode as any)}
                      className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-300 z-10 ${
                        voiceMode === mode 
                          ? mode === 'anime' ? 'text-violet-700' : mode === 'motivational_reel' ? 'text-orange-700' : 'text-indigo-700'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                    >
                      {voiceMode === mode && (
                        <motion.div
                          layoutId="activeVoiceMode"
                          className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {mode === 'standard' ? 'Standard' : mode === 'anime' ? 'Anime' : 'Reel 🔥'}
                    </button>
                  ))}
                </div>
             )}
          </div>

          {activeTab === 'image' && (
            <>
              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Describe your character
                </label>
                <div className="relative group">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A muscular hero climbing a skyscraper surrounded by flames..."
                    className="w-full h-32 bg-slate-50/50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white resize-none outline-none transition-all duration-300 ease-out"
                  />
                  <div className="absolute bottom-3 right-3 text-xs font-medium text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-100">
                    {prompt.length} chars
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  Art Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`relative px-3 py-3 rounded-2xl text-xs font-bold transition-colors duration-300 text-center z-10 overflow-hidden ${
                        selectedStyle === style 
                          ? 'text-indigo-700' 
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {selectedStyle === style && (
                        <motion.div
                          layoutId="activeStyle"
                          className="absolute inset-0 bg-indigo-100 border-2 border-indigo-500 rounded-2xl -z-10 shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <Ratio size={14} /> Aspect Ratio
                </label>
                <div className="flex flex-wrap gap-3">
                  {RATIOS.map(ratio => (
                    <button
                      key={ratio.value}
                      onClick={() => setSelectedRatio(ratio.value)}
                      className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors duration-300 flex items-center gap-2 z-10 overflow-hidden ${
                        selectedRatio === ratio.value 
                          ? 'text-indigo-700' 
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {selectedRatio === ratio.value && (
                        <motion.div
                          layoutId="activeRatio"
                          className="absolute inset-0 bg-indigo-100 border-2 border-indigo-500 rounded-2xl -z-10 shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        {ratio.icon}
                        {ratio.label} <span className="opacity-50 font-normal ml-0.5">({ratio.value})</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'thumbnail' && (
            <div className="space-y-3">
              <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Video Topic / Title
              </label>
              <div className="relative group">
                <textarea
                  value={thumbnailTopic}
                  onChange={(e) => setThumbnailTopic(e.target.value)}
                  placeholder="e.g. I Survived 50 Hours In Antarctica..."
                  className="w-full h-32 bg-slate-50/50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-red-100 focus:border-red-500 focus:bg-white resize-none outline-none transition-all duration-300 ease-out"
                />
                <div className="absolute bottom-3 right-3 text-xs font-medium text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-100">
                  {thumbnailTopic.length} chars
                </div>
              </div>
              <div className="text-xs text-center font-bold p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-red-600 bg-red-50 border-red-100 mt-4">
                 <Sparkles size={14} />
                 Thumbnail settings are automatically optimized for high CTR, 16:9 ratio, and cinematic lighting.
              </div>
            </div>
          )}

          {activeTab === 'transform' && (
            <>
              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Upload Image
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setTransformImageFile(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {transformImageFile ? (
                    <div className="relative w-full max-w-xs mx-auto aspect-square rounded-xl overflow-hidden shadow-md">
                      <img src={transformImageFile} alt="Upload preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransformImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg hover:bg-black/70 transition-colors"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Upload size={24} />
                      </div>
                      <p className="text-slate-600 font-medium">Click to upload an image</p>
                      <p className="text-slate-400 text-xs mt-1">JPG, PNG, WebP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Art Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TRANSFORM_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setSelectedTransformStyle(style)}
                      className={`relative px-3 py-3 rounded-2xl text-xs font-bold transition-colors duration-300 text-center z-10 overflow-hidden ${
                        selectedTransformStyle === style 
                          ? 'text-emerald-700' 
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {selectedTransformStyle === style && (
                        <motion.div
                          layoutId="activeTransformStyle"
                          className="absolute inset-0 bg-emerald-100 border-2 border-emerald-500 rounded-2xl -z-10 shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Additional Prompt (Optional)
                </label>
                <div className="relative group">
                  <textarea
                    value={transformImagePrompt}
                    onChange={(e) => setTransformImagePrompt(e.target.value)}
                    placeholder="e.g. make it night cyberpunk city, add magical forest background..."
                    className="w-full h-24 bg-slate-50/50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white resize-none outline-none transition-all duration-300 ease-out"
                  />
                  <div className="absolute bottom-3 right-3 text-xs font-medium text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-100">
                    {transformImagePrompt.length} chars
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Negative Prompt (Optional)
                </label>
                <div className="relative group">
                  <textarea
                    value={transformNegativePrompt}
                    onChange={(e) => setTransformNegativePrompt(e.target.value)}
                    placeholder="e.g. blurry, low quality, distorted, extra limbs..."
                    className="w-full h-16 bg-slate-50/50 border-2 border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white resize-none outline-none transition-all duration-300 ease-out"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Transformation Intensity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Subtle", "Balanced", "Extreme"].map(intensity => (
                      <button
                        key={intensity}
                        onClick={() => setSelectedTransformIntensity(intensity)}
                        className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors duration-300 flex items-center gap-2 z-10 overflow-hidden ${
                          selectedTransformIntensity === intensity 
                            ? 'text-emerald-700' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {selectedTransformIntensity === intensity && (
                          <motion.div
                            layoutId="activeTransformIntensity"
                            className="absolute inset-0 bg-emerald-100 border-2 border-emerald-500 rounded-2xl -z-10 shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        {intensity}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <Ratio size={14} /> Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RATIOS.map(ratio => (
                      <button
                        key={ratio.value}
                        onClick={() => setSelectedTransformRatio(ratio.value)}
                        className={`relative px-3 py-2.5 rounded-2xl text-xs font-bold transition-colors duration-300 flex items-center gap-1.5 z-10 overflow-hidden ${
                          selectedTransformRatio === ratio.value 
                            ? 'text-emerald-700' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {selectedTransformRatio === ratio.value && (
                          <motion.div
                            layoutId="activeTransformRatio"
                            className="absolute inset-0 bg-emerald-100 border-2 border-emerald-500 rounded-2xl -z-10 shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          {ratio.icon}
                          {ratio.value}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-6">
                {/* Upload or Canvas */}
                {!editImageFile ? (
                    <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => document.getElementById('edit-image-upload')?.click()}>
                      <input 
                        id="edit-image-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImageFile(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                          <Upload size={24} />
                        </div>
                        <p className="text-slate-600 font-medium">Click to upload an image</p>
                        <p className="text-slate-400 text-xs mt-1">JPG, PNG, WebP (Max 5MB)</p>
                      </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Toolbar */}
                        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <button onClick={() => setEditAction('green_screen')} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${editAction === 'green_screen' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                                <Monitor size={14} /> Green Screen
                            </button>
                            <button onClick={() => setEditAction('remove_bg')} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${editAction === 'remove_bg' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>
                                <Scissors size={14} /> Remove BG
                            </button>
                            
                            <div className="flex-grow"></div>
                            
                            <button onClick={() => { setEditImageFile(null); }} className="px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-all">
                                <X size={14} /> Clear Image
                            </button>
                        </div>

                        {/* Canvas Area */}
                        <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center min-h-[300px]">
                            <div className="relative inline-block">
                                <img 
                                    ref={imageRef} 
                                    src={editImageFile} 
                                    alt="Edit target" 
                                    className="max-w-full max-h-[500px] object-contain block"
                                    onLoad={(e) => {
                                        if (canvasRef.current) {
                                            canvasRef.current.width = e.currentTarget.naturalWidth;
                                            canvasRef.current.height = e.currentTarget.naturalHeight;
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'audio' && (
            <>
              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${voiceMode === 'anime' ? 'bg-violet-500' : voiceMode === 'motivational_reel' ? 'bg-orange-500' : 'bg-indigo-500'}`}></span>
                  Enter your script {voiceMode !== 'standard' && <span className={`text-xs ml-1 px-2 py-0.5 rounded-full bg-opacity-10 ${voiceMode === 'anime' ? 'text-violet-600 bg-violet-600' : 'text-orange-600 bg-orange-600'}`}>({voiceMode === 'anime' ? 'Anime Mode' : 'Reel Mode'})</span>}
                </label>
                <div className="relative group">
                  <textarea
                    value={audioScript}
                    onChange={(e) => setAudioScript(e.target.value)}
                    placeholder={
                      voiceMode === 'anime' ? "In a world where magic has faded, one warrior rises..." :
                      voiceMode === 'motivational_reel' ? "Success is not final, failure is not fatal: it is the courage to continue that counts." :
                      "Hello! Welcome to Aepix AI. I can bring your stories to life."
                    }
                    className={`w-full h-32 bg-slate-50/50 border-2 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:ring-4 focus:bg-white resize-none outline-none transition-all duration-300 ease-out ${
                      voiceMode === 'anime' ? 'border-violet-100 focus:ring-violet-100 focus:border-violet-500' : 
                      voiceMode === 'motivational_reel' ? 'border-orange-100 focus:ring-orange-100 focus:border-orange-500' :
                      'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-xs font-medium text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-100">
                    {audioScript.length} chars
                  </div>
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${voiceMode === 'anime' ? 'bg-violet-500' : voiceMode === 'motivational_reel' ? 'bg-orange-500' : 'bg-indigo-500'}`}></span>
                  Select Voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VOICES.map(voice => (
                    <button
                      key={voice.id}
                      onClick={() => setSelectedVoice(voice.id)}
                      disabled={voiceMode !== 'standard' && voice.id !== 'Fenrir'}
                      className={`relative px-4 py-3 rounded-2xl text-sm font-bold transition-colors duration-300 flex items-center gap-3 z-10 overflow-hidden ${
                        selectedVoice === voice.id 
                          ? voiceMode === 'anime' ? 'text-violet-700' :
                            voiceMode === 'motivational_reel' ? 'text-orange-700' :
                            'text-indigo-700' 
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      } ${(voiceMode !== 'standard' && voice.id !== 'Fenrir') ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
                    >
                      {selectedVoice === voice.id && (
                        <motion.div
                          layoutId="activeVoice"
                          className={`absolute inset-0 border-2 rounded-2xl -z-10 shadow-sm ${
                            voiceMode === 'anime' ? 'bg-violet-50 border-violet-500' :
                            voiceMode === 'motivational_reel' ? 'bg-orange-50 border-orange-500' :
                            'bg-indigo-50 border-indigo-500'
                          }`}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className={`w-3 h-3 rounded-full shadow-sm relative z-10 ${selectedVoice === voice.id ? (voiceMode === 'anime' ? 'bg-violet-500' : voiceMode === 'motivational_reel' ? 'bg-orange-500' : 'bg-indigo-500') : 'bg-slate-300'}`}></div>
                      <span className="relative z-10">{voice.name}</span>
                    </button>
                  ))}
                </div>
                {voiceMode !== 'standard' && (
                  <p className={`text-xs ml-2 font-medium flex items-center gap-1.5 ${voiceMode === 'anime' ? 'text-violet-600' : 'text-orange-600'}`}>
                    <Sparkles size={12} /> Fenrir is optimized for this preset.
                  </p>
                )}
              </div>

              {/* Advanced Audio Controls Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 ${voiceMode !== 'standard' ? 'opacity-60 pointer-events-none grayscale-[0.5]' : ''}`}>
                 
                 {/* Language */}
                 <div className={`space-y-3 ${voiceMode !== 'standard' ? 'opacity-100 pointer-events-auto grayscale-0' : ''}`}>
                    <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                      <Languages size={14} /> Language
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        disabled={voiceMode === 'motivational_reel'} // Force Hindi/Indian for Reel mode
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 block p-3 outline-none font-bold disabled:opacity-70 appearance-none transition-all"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                      </div>
                    </div>
                    {voiceMode === 'anime' && selectedLanguage === 'Indian English' && (
                      <p className="text-[10px] text-red-500 ml-1 font-medium">
                        * 'Indian Accent' is disabled in Anime Mode. Switching to Neutral Anime Dub style.
                      </p>
                    )}
                    {voiceMode === 'motivational_reel' && (
                      <p className="text-[10px] text-orange-500 ml-1 font-medium">
                        * Locked to Hindi for this preset.
                      </p>
                    )}
                 </div>

                 {/* Tone */}
                 <div className="space-y-3">
                    <label className="text-slate-700 font-bold text-sm ml-1 flex items-center gap-2">
                      <Sliders size={14} /> Emotional Tone
                    </label>
                    <div className="relative">
                      <select 
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 block p-3 outline-none font-bold appearance-none transition-all"
                      >
                        {TONES.map(tone => (
                          <option key={tone} value={tone}>{tone}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                      </div>
                    </div>
                 </div>

                 {/* Speed */}
                 <div className="space-y-3">
                    <label className="text-slate-700 font-bold text-sm ml-1">Speaking Rate</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 relative">
                      {SPEEDS.map(speed => (
                        <button
                          key={speed}
                          onClick={() => setSelectedSpeed(speed)}
                          className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-colors duration-300 z-10 ${
                            selectedSpeed === speed ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          }`}
                        >
                          {selectedSpeed === speed && (
                            <motion.div
                              layoutId="activeSpeed"
                              className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          {speed}
                        </button>
                      ))}
                    </div>
                 </div>

                 {/* Pitch */}
                 <div className="space-y-3">
                    <label className="text-slate-700 font-bold text-sm ml-1">Pitch</label>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 relative">
                      {PITCHES.map(pitch => (
                        <button
                          key={pitch}
                          onClick={() => setSelectedPitch(pitch)}
                          className={`relative flex-1 py-2 rounded-xl text-xs font-bold transition-colors duration-300 z-10 ${
                            selectedPitch === pitch ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                          }`}
                        >
                          {selectedPitch === pitch && (
                            <motion.div
                              layoutId="activePitch"
                              className="absolute inset-0 bg-white rounded-xl -z-10 shadow-sm"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          {pitch}
                        </button>
                      ))}
                    </div>
                 </div>

              </div>
              
              {voiceMode !== 'standard' && (
                <div className={`text-xs text-center font-bold p-3 rounded-xl border-2 flex items-center justify-center gap-2 ${
                  voiceMode === 'anime' ? 'text-violet-600 bg-violet-50 border-violet-100' : 
                  'text-orange-600 bg-orange-50 border-orange-100'
                }`}>
                   <Sparkles size={14} />
                   Audio settings are automatically optimized for {voiceMode === 'anime' ? 'Anime Narrator' : 'Motivational Reel'} style.
                </div>
              )}
            </>
          )}

          <div className="pt-4 flex flex-col items-end gap-2">
            <Button 
              onClick={handleGenerate} 
              isLoading={isGenerating} 
              disabled={isButtonDisabled()}
              icon={getButtonIcon()}
              className={`w-full md:w-auto px-8 py-4 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                activeTab === 'thumbnail' ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30' :
                voiceMode === 'anime' && activeTab === 'audio' ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30' : 
                voiceMode === 'motivational_reel' && activeTab === 'audio' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/30' :
                ''
              }`}
            >
              {getButtonText()}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-col sm:flex-row items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 w-full">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-sm flex-grow font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Area */}
      {currentResult && (
        <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xl shadow-indigo-100/50 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xl font-fredoka font-semibold text-slate-800">Result</h3>
             <a 
                href={currentResult.url} 
                download={
                  currentResult.type === GenerationType.IMAGE ? `aepix-image-${Date.now()}.png` : 
                  currentResult.type === GenerationType.VIDEO ? `aepix-video-${Date.now()}.mp4` :
                  `aepix-voice-${Date.now()}.wav`
                }
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 text-sm font-bold transition-colors"
             >
               <Download size={16} /> Download
             </a>
           </div>
           
           <div className="rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 p-4 min-h-[200px]">
               {currentResult.type === GenerationType.IMAGE && (
                 <img 
                   src={currentResult.url} 
                   alt={currentResult.prompt} 
                   className="max-h-[500px] w-auto mx-auto object-contain shadow-md rounded-lg"
                 />
               )}
               {currentResult.type === GenerationType.VIDEO && (
                 <video 
                   src={currentResult.url} 
                   controls 
                   autoPlay 
                   loop 
                   className="max-h-[500px] w-auto mx-auto object-contain shadow-md rounded-lg"
                 />
               )}
               {currentResult.type === GenerationType.AUDIO && (
                 <div className="w-full max-w-md flex flex-col items-center gap-4 py-8">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner relative ${currentResult.style.includes('Anime') ? 'bg-violet-100' : 'bg-indigo-100'}`}>
                       <Music size={40} className={currentResult.style.includes('Anime') ? "text-violet-500" : "text-indigo-500"} />
                       <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                          {currentResult.style.includes('Hindi') ? <span className="text-xs font-bold px-1">🇮🇳</span> : <Mic size={12} className="text-slate-400" />}
                       </div>
                    </div>
                    <audio controls src={currentResult.url} className="w-full shadow-sm rounded-full" />
                 </div>
               )}
           </div>
           <div className="mt-4 flex flex-wrap gap-2">
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentResult.style.includes('Anime') ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'}`}>
               {currentResult.style}
             </span>
             {currentResult.aspectRatio && (
               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                 {currentResult.aspectRatio}
               </span>
             )}
           </div>
           <p className="mt-2 text-slate-600 text-sm italic border-l-2 border-indigo-500 pl-3 line-clamp-3">
             "{currentResult.prompt}"
           </p>
        </div>
      )}

    </div>
  );
};