import React from 'react';
import { motion } from 'motion/react';
import { signInWithGoogle } from '../firebase';
import { Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center relative selection:bg-indigo-100 p-4">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(#3b82f6_2px,transparent_2px)] [background-size:24px_24px] animate-background-move opacity-40 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-indigo-600/10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-indigo-600/20 bg-indigo-900 flex items-center justify-center">
            <img src="/logo.png" alt="Aepix AI Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-xs">LOGO</span>'; }} />
          </div>
        </div>
        
        <h1 className="text-3xl font-fredoka font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          Welcome to Aepix AI
        </h1>
        <p className="text-slate-500 mb-8 font-medium">
          Sign in to access the AI Lab and start creating amazing content.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
          <Sparkles size={14} className="text-yellow-500" />
          Powered by Gemini
        </div>
      </motion.div>
    </div>
  );
};
