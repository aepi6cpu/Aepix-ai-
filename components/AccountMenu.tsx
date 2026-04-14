import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { User, Globe, Coins, Moon, CreditCard, LogOut, AlertCircle, ChevronLeft, Check, Activity } from 'lucide-react';

interface AccountMenuProps {
  user: FirebaseUser;
  onSignOut: () => void;
  credits: number;
  onOpenPurchase: () => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

type MenuView = 'main' | 'language' | 'signout';

const LANGUAGES = [
  'English', 'Español', 'Français', 'Deutsch', 'हिन्दी', 
  '中文', '日本語', 'العربية', 'Português', 'Русский'
];

export const AccountMenu: React.FC<AccountMenuProps> = ({ user, onSignOut, credits, onOpenPurchase, isAdmin, onOpenAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>('main');
  const [language, setLanguage] = useState('English');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset view after animation completes
        setTimeout(() => setView('main'), 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmSignOut = () => {
    setIsOpen(false);
    onSignOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="Account"
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="User" 
            className="w-full h-full rounded-full object-cover" 
            referrerPolicy="no-referrer" 
          />
        ) : (
          <User size={20} className="text-slate-600" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, x: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, x: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl shadow-indigo-900/10 border border-slate-100 overflow-hidden z-50"
          >
            <AnimatePresence mode="wait">
              {view === 'main' && (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="p-2">
                    <div className="px-3 py-2 flex items-center justify-between text-sm text-slate-700 mb-1">
                      <div className="flex items-center gap-3">
                        <Coins size={16} className="text-yellow-500" />
                        <span className="font-medium">Credits</span>
                      </div>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{credits}</span>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        onOpenPurchase();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <CreditCard size={16} className="text-slate-400" />
                      <span className="font-medium">Purchase Credits</span>
                    </button>
                    
                    <button 
                      onClick={() => setView('language')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <Globe size={16} className="text-slate-400" />
                      <span className="font-medium">Language: {language}</span>
                    </button>
                    
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left">
                      <Moon size={16} className="text-slate-400" />
                      <span className="font-medium">Dark Mode</span>
                      <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
                    </button>

                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors text-left mt-1 border border-indigo-100 bg-indigo-50/50"
                      >
                        <Activity size={16} className="text-indigo-600" />
                        <span className="font-bold">Admin Dashboard</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={() => setView('signout')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left font-medium"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}

              {view === 'language' && (
                <motion.div
                  key="language"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-[340px]"
                >
                  <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                    <button 
                      onClick={() => setView('main')}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <h3 className="font-bold text-slate-900">Select Language</h3>
                  </div>
                  <div className="p-2 overflow-y-auto flex-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setView('main');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-colors text-left ${
                          language === lang 
                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        {lang}
                        {language === lang && <Check size={16} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {view === 'signout' && (
                <motion.div
                  key="signout"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 text-center"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-600">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Sign Out?</h3>
                  <p className="text-sm text-slate-500 mb-5">Are you sure you want to sign out of your account?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setView('main')}
                      className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSignOut}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
