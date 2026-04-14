import React, { useEffect, useState } from 'react';

export const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState<'bouncing' | 'text' | 'finished'>('bouncing');

  useEffect(() => {
    // Stage 1: Bouncing ball (0-2s)
    const timer1 = setTimeout(() => {
      setStage('text');
    }, 2000);

    // Stage 2: Text appears (2-4s)
    const timer2 = setTimeout(() => {
      setStage('finished');
      setTimeout(onComplete, 500); // Give a little time for exit animation
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (stage === 'finished') return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center transition-opacity duration-500">
      {stage === 'bouncing' && (
        <div className="flex flex-col items-center animate-out fade-out duration-500 fill-mode-forwards" style={{ animationDelay: '1.8s' }}>
          <div className="w-8 h-8 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-12 h-2 bg-slate-200 rounded-full mt-8 animate-pulse"></div>
        </div>
      )}
      
      {stage === 'text' && (
        <div className="animate-in zoom-in fade-in duration-700 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-fredoka font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            aepix ai
          </h1>
          <p className="mt-4 text-slate-400 font-medium tracking-widest text-sm uppercase animate-pulse">
            Loading Studio...
          </p>
        </div>
      )}
    </div>
  );
};
