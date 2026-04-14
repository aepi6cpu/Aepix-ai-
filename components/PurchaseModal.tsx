import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Smartphone, Coins } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCredits: (amount: number) => void;
}

const PACKAGES = [
  { coins: 100, price: 20 },
  { coins: 200, price: 40 },
  { coins: 300, price: 55 },
];

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, onAddCredits }) => {
  const [step, setStep] = useState<'select' | 'qr'>('select');
  const [selectedMethod, setSelectedMethod] = useState<'upi'>('upi');
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[1]);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setStep('select');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setStep('qr');
  };

  // Generate UPI URI with user's specific UPI ID
  const upiUri = `upi://pay?pa=8279360272@fam&pn=Arpit%20Sharma&am=${selectedPackage.price}&cu=INR`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Coins className="text-yellow-500" />
            Purchase Credits
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Method Selection */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">1. Select Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedMethod('upi')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Smartphone size={18} />
                      <span className="font-bold">UPI</span>
                    </button>
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
                    >
                      <CreditCard size={18} />
                      <span className="font-bold">Card (Soon)</span>
                    </button>
                  </div>
                </div>

                {/* Package Selection */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">2. Select Package</h3>
                  <div className="space-y-3">
                    {PACKAGES.map((pkg) => (
                      <button
                        key={pkg.coins}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          selectedPackage.coins === pkg.coins ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPackage.coins === pkg.coins ? 'border-indigo-600' : 'border-slate-300'
                          }`}>
                            {selectedPackage.coins === pkg.coins && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                          </div>
                          <span className={`font-bold ${selectedPackage.coins === pkg.coins ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {pkg.coins} Coins
                          </span>
                        </div>
                        <span className={`font-bold ${selectedPackage.coins === pkg.coins ? 'text-indigo-600' : 'text-slate-500'}`}>
                          ₹{pkg.price}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all"
                >
                  Confirm & Pay ₹{selectedPackage.price}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Scan to Pay</h3>
                  <p className="text-slate-500 mt-1">Pay ₹{selectedPackage.price} to get {selectedPackage.coins} Coins</p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                  <QRCodeSVG value={upiUri} size={200} level="H" includeMargin={true} />
                </div>

                <div className="w-full space-y-3">
                  <p className="text-xs text-slate-400">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                  
                  <button
                    onClick={() => setStep('select')}
                    className="w-full py-3 text-slate-500 hover:text-slate-700 font-semibold transition-colors"
                  >
                    Back
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
