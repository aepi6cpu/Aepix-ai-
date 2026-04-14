import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export type LegalPageType = 'contact' | 'terms' | 'privacy' | 'refund' | null;

interface LegalModalProps {
  page: LegalPageType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  if (!page) return null;

  const content = {
    contact: {
      title: "Contact Us",
      body: (
        <div className="space-y-4 text-slate-600">
          <p>We would love to hear from you! If you have any questions, concerns, or need support regarding Aepix AI, please reach out to us.</p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-900">Email Support:</p>
            <a href="mailto:arpitsharmaetw001@gmail.com" className="text-indigo-600 hover:underline">arpitsharmaetw001@gmail.com</a>
          </div>
          <p><strong>Operating Address:</strong><br />Aepix AI<br />India</p>
          <p>We aim to respond to all inquiries within 24-48 business hours.</p>
        </div>
      )
    },
    terms: {
      title: "Terms & Conditions",
      body: (
        <div className="space-y-4 text-slate-600">
          <p><strong>Last updated: April 2026</strong></p>
          <p>Welcome to Aepix AI. By accessing or using our website and services, you agree to be bound by these Terms & Conditions.</p>
          <h3 className="font-bold text-slate-900 mt-4">1. Use of Service</h3>
          <p>Aepix AI provides artificial intelligence generation tools. You agree to use these tools only for lawful purposes and in accordance with these Terms.</p>
          <h3 className="font-bold text-slate-900 mt-4">2. Credits and Payments</h3>
          <p>Our services operate on a credit-based system. Credits purchased are added to your account and consumed upon generating content. All payments are processed securely via third-party payment gateways.</p>
          <h3 className="font-bold text-slate-900 mt-4">3. User Content</h3>
          <p>You retain all rights to the prompts you provide. Aepix AI does not claim ownership over the generated outputs, but you are responsible for ensuring your generated content does not violate any laws or third-party rights.</p>
          <h3 className="font-bold text-slate-900 mt-4">4. Limitation of Liability</h3>
          <p>Aepix AI shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.</p>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-slate-600">
          <p><strong>Last updated: April 2026</strong></p>
          <p>At Aepix AI, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.</p>
          <h3 className="font-bold text-slate-900 mt-4">1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account (name, email address, profile picture) and when you make a purchase.</p>
          <h3 className="font-bold text-slate-900 mt-4">2. How We Use Your Information</h3>
          <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          <h3 className="font-bold text-slate-900 mt-4">3. Information Sharing</h3>
          <p>We do not sell your personal information. We may share your information with third-party vendors (like payment processors) who need access to such information to carry out work on our behalf.</p>
          <h3 className="font-bold text-slate-900 mt-4">4. Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect the security of your personal information.</p>
        </div>
      )
    },
    refund: {
      title: "Refund & Cancellation Policy",
      body: (
        <div className="space-y-4 text-slate-600">
          <p><strong>Last updated: April 2026</strong></p>
          <p>Thank you for choosing Aepix AI. We want you to be satisfied with your purchase.</p>
          <h3 className="font-bold text-slate-900 mt-4">1. Refund Eligibility</h3>
          <p>Refunds may be granted within 7 days of purchase ONLY IF the purchased credits remain completely unused. Once any portion of the purchased credits has been used to generate content, the purchase becomes non-refundable.</p>
          <h3 className="font-bold text-slate-900 mt-4">2. Processing Refunds</h3>
          <p>If you are eligible for a refund, please contact us at arpitsharmaetw001@gmail.com with your account details and transaction ID. Approved refunds will be processed and credited back to the original method of payment within 5-7 business days.</p>
          <h3 className="font-bold text-slate-900 mt-4">3. Cancellations</h3>
          <p>Since our service operates on a one-time purchase credit system rather than a recurring subscription, there are no subscriptions to cancel. You simply choose whether or not to purchase additional credits when you run out.</p>
          <h3 className="font-bold text-slate-900 mt-4">4. Failed Transactions</h3>
          <p>If a transaction fails but money was deducted from your account, it will automatically be refunded by your bank or payment provider within 3-5 business days.</p>
        </div>
      )
    }
  };

  const currentContent = content[page];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-20">
          <h2 className="text-xl font-bold text-slate-900">
            {currentContent.title}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {currentContent.body}
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            Understood
          </button>
        </div>
      </motion.div>
    </div>
  );
};
