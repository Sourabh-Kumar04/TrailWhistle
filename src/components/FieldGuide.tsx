import React from 'react';
import { Compass, ShieldCheck, Heart, Cpu, Trees, Sun, VolumeX, Sparkles } from 'lucide-react';

interface FieldGuideProps {
  isSunlightMode: boolean;
}

export const FieldGuide: React.FC<FieldGuideProps> = ({ isSunlightMode }) => {
  return (
    <div className="space-y-4 animate-fade-in text-sm">
      {/* Hero Grass Card */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isSunlightMode 
          ? 'bg-white border-2 border-black text-black shadow-md' 
          : 'bg-gradient-to-br from-forest-900 to-forest-950 border-forest-700 text-earth-50 shadow-xl'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-feather-yellow mb-2">
          <Trees className="w-4 h-4" />
          <span>Theme: Touch Grass</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
          The Shortest Screen Time in AI
        </h2>
        <p className={`text-xs sm:text-sm leading-relaxed ${isSunlightMode ? 'text-gray-800' : 'text-forest-200'}`}>
          Most modern AI apps are designed to trap you in an infinite chat doom-scroll. TrailWhistle is built with the opposite philosophy: <strong className="text-white">your screen should be the shortest part of your day</strong>.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-4 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-100'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-feather-yellow flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm mb-1">Zero Signal Required</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            True wilderness has no 5G bars. Open-weight models running on WebAssembly ensure your field recorder never fails deep in the backcountry.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-100'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-feather-yellow flex items-center justify-center mb-2">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm mb-1">Open Weights, Zero Telemetry</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            No API keys. No monthly token billing. Your audio never leaves your device. Audio is classified 100% on-device by BirdNET v2.4 ONNX across 6,522 real bird species.
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-100'
        }`}>
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-feather-yellow flex items-center justify-center mb-2">
            <Sun className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm mb-1">Outdoor-First UX</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            High-contrast sunlight mode, tactile 48px+ touch targets, and 3-second rapid recording let you identify birds with one thumb while hiking.
          </p>
        </div>
      </div>

      {/* Ethical Birding Guidelines */}
      <div className={`p-5 rounded-xl border ${
        isSunlightMode ? 'bg-white border-black text-black' : 'bg-forest-900/80 border-forest-700 text-earth-100'
      }`}>
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400" />
          Ethical Trail Observation Code
        </h3>
        <ul className="space-y-2 text-xs opacity-90 leading-relaxed">
          <li className="flex items-start gap-2">
            <VolumeX className="w-4 h-4 text-feather-yellow shrink-0 mt-0.5" />
            <span><strong>Never play loud audio playback to lure birds:</strong> Artificial playback distresses breeding birds and drains vital energy during migration. Listen passively.</span>
          </li>
          <li className="flex items-start gap-2">
            <Compass className="w-4 h-4 text-forest-400 shrink-0 mt-0.5" />
            <span><strong>Keep to marked trails:</strong> Off-trail trampling crushes fragile ground nests and sensitive understory mosses.</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-feather-accent shrink-0 mt-0.5" />
            <span><strong>Tune your ears at dawn:</strong> The "Dawn Chorus" (30 minutes before sunrise until 2 hours after) provides peak vocal activity.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
