import React, { useState, useEffect } from 'react';
import { Creator } from './components/Creator';
import { History } from './components/History';
import { InfoSection } from './components/InfoSection';
import { InspirationGallery } from './components/InspirationGallery';
import { LoadingScreen } from './components/LoadingScreen';
import { Login } from './components/Login';
import { AccountMenu } from './components/AccountMenu';
import { PurchaseModal } from './components/PurchaseModal';
import { AdminPanel } from './components/AdminPanel';
import { LegalModal, LegalPageType } from './components/LegalModal';
import { GeneratedItem } from './types';
import { Tv, Sparkles, History as HistoryIcon } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { auth, logOut, db } from './firebase';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<GeneratedItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [credits, setCredits] = useState(200);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalPage, setLegalPage] = useState<LegalPageType>(null);

  const ADMIN_EMAIL = 'arpitsharmaetw001@gmail.com';

  useEffect(() => {
    // Log visit
    const logVisit = async () => {
      try {
        await addDoc(collection(db, 'visits'), {
          timestamp: serverTimestamp(),
          userAgent: navigator.userAgent,
          path: window.location.pathname
        });
      } catch (e) {
        console.error("Could not log visit", e);
      }
    };
    logVisit();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Sync user to Firestore
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastLogin: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.error("Could not sync user", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('aepix_ai_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
        // If parsing fails, clear corrupted data
        localStorage.removeItem('aepix_ai_history');
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    const saveToStorage = (itemsToSave: GeneratedItem[]) => {
      try {
        localStorage.setItem('aepix_ai_history', JSON.stringify(itemsToSave));
      } catch (e) {
        // QuotaExceededError or similar
        console.warn("Storage quota exceeded, attempting to trim history...");
        if (itemsToSave.length > 0) {
          // Remove the oldest item (last in the array) and try again recursively
          // This ensures we save as many recent items as possible without crashing
          const trimmedHistory = itemsToSave.slice(0, -1);
          saveToStorage(trimmedHistory);
        }
      }
    };

    saveToStorage(history);
  }, [history]);

  const handleNewGeneration = (item: GeneratedItem) => {
    setHistory(prev => [item, ...prev]);
    setIsHistoryOpen(true); // Auto-open history on new generation
  };

  const handleDeleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem('aepix_ai_history');
  };

  if (!isAuthReady) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 relative selection:bg-indigo-100">
      
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      {/* Animated Background Layer */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(#3b82f6_2px,transparent_2px)] [background-size:24px_24px] animate-background-move opacity-40 pointer-events-none"></div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col min-h-screen transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-600/20 bg-indigo-900 flex items-center justify-center">
                <img src="/logo.png" alt="Aepix AI Logo" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-xs">LOGO</span>'; }} />
              </div>
              <div>
                <h1 className="text-2xl font-fredoka font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Aepix AI
                </h1>
                <p className="text-xs text-slate-500 font-semibold tracking-wide">AI LAB</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <Sparkles size={12} className="text-yellow-500" />
                Powered by Gemini
              </div>
              
              <AccountMenu 
                user={user} 
                onSignOut={logOut} 
                credits={credits} 
                onOpenPurchase={() => setIsPurchaseModalOpen(true)} 
                isAdmin={user.email === ADMIN_EMAIL}
                onOpenAdmin={() => setIsAdminOpen(true)}
              />
              
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-colors border border-indigo-200"
              >
                <HistoryIcon size={18} />
                <span className="hidden sm:inline">History</span>
                {history.length > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {history.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8 flex-grow">
          <div className="text-center mb-8 px-4">
            <h2 className="text-3xl sm:text-4xl font-fredoka font-bold text-slate-900 mb-3">
              What will you create today?
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto text-lg">
              Turn your wildest ideas into reality with powerful AI generation.
            </p>
          </div>

          <Creator 
            onGenerate={handleNewGeneration} 
            credits={credits} 
            onDeductCredits={(amount) => setCredits(c => Math.max(0, c - amount))} 
            onOpenPurchase={() => setIsPurchaseModalOpen(true)} 
          />

          <InspirationGallery />
          
          <InfoSection />
        </main>

        {/* Sidebar History - Fixed in corner */}
        <History 
          items={history} 
          isOpen={isHistoryOpen} 
          onClose={() => setIsHistoryOpen(false)} 
          onDelete={handleDeleteItem}
          onClearAll={handleClearAll}
        />

        <PurchaseModal 
          isOpen={isPurchaseModalOpen} 
          onClose={() => setIsPurchaseModalOpen(false)} 
          onAddCredits={(amount) => setCredits(c => c + amount)} 
        />

        {isAdminOpen && user.email === ADMIN_EMAIL && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}

        <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />

        {/* Footer */}
        <footer className="py-8 border-t border-slate-200 bg-white/90">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm font-medium text-slate-600">
              <button onClick={() => setLegalPage('contact')} className="hover:text-indigo-600 transition-colors">Contact Us</button>
              <button onClick={() => setLegalPage('terms')} className="hover:text-indigo-600 transition-colors">Terms & Conditions</button>
              <button onClick={() => setLegalPage('privacy')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
              <button onClick={() => setLegalPage('refund')} className="hover:text-indigo-600 transition-colors">Refund & Cancellation</button>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-sm font-semibold">
                © 2026 Aepix AI
              </p>
              <p className="text-slate-400 text-xs mt-2">
                Made with <span className="text-red-500">♥</span> by Arpit Sharma
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;