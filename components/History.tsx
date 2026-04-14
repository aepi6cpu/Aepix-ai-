import React, { useState, useMemo } from 'react';
import { GeneratedItem, GenerationType } from '../types';
import { Image as ImageIcon, Trash2, Mic, Music, X, Download, Calendar, ChevronLeft, Video } from 'lucide-react';

interface HistoryProps {
  items: GeneratedItem[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const History: React.FC<HistoryProps> = ({ items, isOpen, onClose, onDelete, onClearAll }) => {
  const [activeTab, setActiveTab] = useState<'images' | 'voices' | 'videos'>('images');
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const images = useMemo(() => items.filter(item => item.type === GenerationType.IMAGE), [items]);
  const voices = useMemo(() => items.filter(item => item.type === GenerationType.AUDIO), [items]);
  const videos = useMemo(() => items.filter(item => item.type === GenerationType.VIDEO), [items]);

  const activeItems = activeTab === 'images' ? images : activeTab === 'voices' ? voices : videos;

  // Reset confirmation state when history is closed
  React.useEffect(() => {
    if (!isOpen) {
      setIsConfirmingClear(false);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-xl">
           <div className="flex items-center gap-2">
             <button 
               onClick={onClose}
               className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 flex items-center justify-center"
               aria-label="Back"
             >
               <ChevronLeft size={20} />
             </button>
             <h3 className="text-lg font-fredoka font-bold text-slate-800">
               History
             </h3>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
           >
             <X size={20} />
           </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap px-2 ${
              activeTab === 'images' 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <ImageIcon size={14} /> 
            Images ({images.length})
          </button>
          <button
            onClick={() => setActiveTab('voices')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all whitespace-nowrap px-2 ${
              activeTab === 'voices' 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <Mic size={14} /> 
            Voices ({voices.length})
          </button>
        </div>

        {/* List Content */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/30">
          {activeItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
               {activeTab === 'images' && <ImageIcon size={32} className="opacity-20" />}
               {activeTab === 'voices' && <Mic size={32} className="opacity-20" />}
               <p className="text-sm font-semibold">No {activeTab} yet.</p>
             </div>
          ) : (
            activeItems.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Header Row: Date & Delete */}
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                     <Calendar size={10} />
                     {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <button 
                     onClick={() => onDelete(item.id)}
                     className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                     title="Delete item"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>

                {/* Content */}
                <div className="flex gap-3">
                  {item.type === GenerationType.IMAGE ? (
                    <div className="w-20 h-20 shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100 relative">
                      <img src={item.url} alt="thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1">
                        <ImageIcon size={8} /> Image
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-100 relative">
                      <Music size={24} />
                      <div className="absolute top-1 left-1 bg-indigo-600/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white flex items-center gap-1">
                        <Mic size={8} /> Audio
                      </div>
                    </div>
                  )}

                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {item.type === GenerationType.AUDIO ? (
                          <>
                            {item.voice && (
                              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Mic size={10} /> {item.voice}
                              </span>
                            )}
                            {item.tone && item.tone !== 'Neutral' && (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.tone}
                              </span>
                            )}
                            {item.speed && item.speed !== '1.0x' && (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.speed}
                              </span>
                            )}
                            {item.pitch && item.pitch !== 'Default' && (
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                Pitch: {item.pitch}
                              </span>
                            )}
                            {item.mode && item.mode !== 'standard' && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.mode === 'anime' ? 'text-violet-700 bg-violet-100' : 'text-orange-700 bg-orange-100'}`}>
                                {item.mode === 'anime' ? 'Anime' : 'Reel'}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              {item.style}
                            </span>
                            {item.aspectRatio && (
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {item.aspectRatio}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed" title={item.prompt}>
                        {item.prompt}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Controls Row */}
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-50">
                   {item.type === GenerationType.AUDIO && (
                     <audio src={item.url} controls className="h-6 w-full max-w-[140px] mr-auto scale-[0.9] origin-left" />
                   )}
                   
                   <a 
                     href={item.url} 
                     download 
                     className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                   >
                     <Download size={12} /> Download
                   </a>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            {isConfirmingClear ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-slate-600 text-center mb-1">Are you sure?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsConfirmingClear(false)}
                    className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-700 hover:bg-slate-100 py-3 rounded-xl border border-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      onClearAll();
                      setIsConfirmingClear(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 py-3 rounded-xl transition-all shadow-sm shadow-red-500/20"
                  >
                    Yes, Clear All
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsConfirmingClear(true)}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 py-3 rounded-xl border border-dashed border-red-200 hover:border-red-300 transition-all"
              >
                <Trash2 size={14} /> Clear All History
              </button>
            )}
          </div>
        )}

      </div>
    </>
  );
};