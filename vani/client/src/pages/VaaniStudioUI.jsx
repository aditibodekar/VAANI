import React, { useState } from 'react';
import { MotionCard, AnimatedPulseIcon } from './ComponentsUI'; // UI Helper imports

const VaaniStudio = () => {
  const [currentGesture, setCurrentGesture] = useState("Waiting...");
  const [translations, setTranslations] = useState({ en: "", hi: "", mr: "" });
  const [speechInput, setSpeechInput] = useState("");

  const handleGestureReceived = async (gesture) => {
    setCurrentGesture(gesture);
    
    // Fetch multi-lingual translation in parallel
    const [resEn, resHi, resMr] = await Promise.all([
      fetch('http://localhost:5000/translate_text', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ text: gesture, target_lang: 'en' })}).then(r => r.json()),
      fetch('http://localhost:5000/translate_text', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ text: gesture, target_lang: 'hi' })}).then(r => r.json()),
      fetch('http://localhost:5000/translate_text', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ text: gesture, target_lang: 'mr' })}).then(r => r.json()),
    ]);

    setTranslations({
      en: resEn.translated_text,
      hi: resHi.translated_text,
      mr: resMr.translated_text
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-6 font-sans">
      {/* Top Navigation */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          VAANI Live Studio
        </h1>
        <div className="flex items-center space-x-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Real-Time Engine Active</span>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: Video & Gesture Tracker */}
        <section className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 p-2 relative shadow-2xl overflow-hidden min-h-[380px]">
            {/* Gesture interpreter component mounts here */}
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50 flex items-center space-x-2">
              <span className="text-xs text-indigo-300 font-medium">Predicted Sign:</span>
              <span className="text-sm font-bold text-white">{currentGesture}</span>
            </div>
          </div>
        </section>

        {/* Right: Output Translation Cards & Conversation Panel */}
        <section className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 flex-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Translations</h2>

            {/* Language Badges */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center transition-all hover:border-indigo-500/40">
                <span className="text-xs text-slate-400 font-medium">English</span>
                <span className="text-base font-semibold text-slate-100">{translations.en || "—"}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center transition-all hover:border-indigo-500/40">
                <span className="text-xs text-slate-400 font-medium">Hindi (हिंदी)</span>
                <span className="text-base font-semibold text-indigo-300">{translations.hi || "—"}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center transition-all hover:border-indigo-500/40">
                <span className="text-xs text-slate-400 font-medium">Marathi (मराठी)</span>
                <span className="text-base font-semibold text-cyan-300">{translations.mr || "—"}</span>
              </div>
            </div>

            {/* Speech to Sign Input Translation */}
            <div className="pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Speech to Sign Input</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Speak or type to generate sign sequence..." 
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-500 transition-colors"
                  value={speechInput}
                  onChange={(e) => setSpeechInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VaaniStudio;