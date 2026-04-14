import React from 'react';
import { Shield, User, Info, AlertTriangle, CheckCircle, Flame } from 'lucide-react';

export const InfoSection: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-8 mb-8 mt-12">
      
      {/* Main Info Card */}
      <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl shadow-indigo-100/50">
        <h2 className="text-2xl font-fredoka font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Info className="text-indigo-600" />
          About Aepix AI
        </h2>
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Aepix AI ek powerful creative web application hai jo users ko high-quality images aur AI voices generate karne ki suvidha deta hai. Is app ka main purpose creativity aur expression ko expand karna hai, chahe wo intense action scenes ho ya immersive voice narrations.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-2">Key Features:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                <span>High-quality character aur action scene generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                <span>Gemini-powered advanced text-to-voice conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                <span>Flexible aspect ratios aur styles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={18} className="text-green-500 mt-1 shrink-0" />
                <span>Instant downloads aur history tracking</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content Policy */}
      <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl shadow-red-100/50">
        <h2 className="text-2xl font-fredoka font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="text-red-500" />
          Content Policy (Updated)
        </h2>
        <div className="space-y-4 text-slate-700">
          <p className="font-medium">Aepix AI strictly safe-use policy follow karta hai.</p>
          <ul className="space-y-3 font-medium">
            <li className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
              <Flame size={20} className="text-orange-500" />
              <span>
                <strong>Action & Violence Allowed:</strong> Fighting scenes, combat, explosions, fire, battles, aur muscular/aggressive characters generate karna allowed hai.
              </span>
            </li>
            <li className="flex items-center gap-2 text-red-600">
              <span className="text-xl">❌</span>
              <span>18+ / Adult / Nudity / Sexual content strictly prohibited hai.</span>
            </li>
            <li className="flex items-center gap-2 text-red-600">
              <span className="text-xl">❌</span>
              <span>Extreme Gore (kat-pit, heavy blood) allowed nahi hai.</span>
            </li>
            <li className="flex items-center gap-2 text-red-600">
              <span className="text-xl">❌</span>
              <span>Real politicians aur celebrities ki images allowed nahi hain.</span>
            </li>
          </ul>
          <p className="text-sm italic mt-4 bg-red-50 p-3 rounded-lg border border-red-100 text-red-700">
            Agar koi user galat content generate karta hai, to uski zimmedari user ki khud ki hogi.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Creator Info */}
        <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 backdrop-blur-sm shadow-lg">
          <h3 className="text-xl font-fredoka font-bold text-slate-800 mb-3 flex items-center gap-2">
            <User className="text-indigo-600" />
            Creator Information
          </h3>
          <div className="text-slate-700 space-y-2">
            <p className="font-semibold text-lg">Created & Developed by:</p>
            <p className="text-2xl font-bold text-indigo-600">Arpit Sharma</p>
            <p className="text-sm text-slate-600 mt-2">
              Ye application independently design aur develop ki gayi hai, jiska goal hai users ko simple, safe aur creative AI tools provide karna.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 backdrop-blur-sm shadow-lg">
          <h3 className="text-xl font-fredoka font-bold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-600" />
            Disclaimer
          </h3>
          <p className="text-amber-900 leading-relaxed">
            Aepix AI ek AI-based tool hai. Generated images aur voices sirf creative aur personal use ke liye hain. Is app ka misuse kisi bhi galat purpose ke liye karna allowed nahi hai.
          </p>
        </div>
      </div>

    </div>
  );
};