import React from 'react';
import { Compass, ShieldCheck, Heart, Cpu, Trees, Sun, VolumeX, Sparkles, MapPin, Database, FileSpreadsheet } from 'lucide-react';

interface FieldGuideProps {
  isSunlightMode: boolean;
}

export const FieldGuide: React.FC<FieldGuideProps> = ({ isSunlightMode }) => {
  return (
    <div className="space-y-5 animate-fade-in text-sm max-w-4xl mx-auto">
      {/* Hero Grass Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        isSunlightMode 
          ? 'bg-white border-2 border-black text-black shadow-md' 
          : 'bg-gradient-to-br from-forest-900 via-forest-950 to-forest-950 border-forest-700 text-earth-50 shadow-xl'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-feather-yellow mb-2">
          <Trees className="w-4 h-4" />
          <span>Theme: Touch Grass & Area Biodiversity Survey</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
          The Shortest Screen Time in AI
        </h2>
        <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${isSunlightMode ? 'text-gray-800' : 'text-forest-200'}`}>
          Most modern AI apps are designed to trap you in an infinite chat doom-scroll. TrailWhistle is built with the opposite philosophy: <strong className="text-white">your screen should be the shortest part of your day</strong>. Step outside, survey your local habitat, build a live avian census, and export open scientific data.
        </p>
      </div>

      {/* Area Biodiversity Survey Methodology Card */}
      <div className={`p-6 rounded-2xl border ${
        isSunlightMode ? 'bg-white border-2 border-black text-black' : 'bg-forest-900/70 border-forest-800 text-earth-100'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-feather-yellow mb-3">
          <MapPin className="w-4 h-4" />
          <span>Core Field Protocol: Area Biodiversity Survey</span>
        </div>
        <h3 className="text-lg font-bold mb-2">How Naturalists Survey Avian Diversity</h3>
        <p className="text-xs opacity-90 leading-relaxed mb-4">
          Rather than identifying a single bird in isolation, ecological surveys monitor an entire geographic transect over a fixed time span. TrailWhistle enables acoustic area census right from your phone:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-3.5 rounded-xl border ${
            isSunlightMode ? 'bg-gray-50 border-gray-300' : 'bg-forest-950/80 border-forest-800'
          }`}>
            <div className="font-bold text-feather-yellow mb-1">1. Arrive at Location</div>
            <div className="opacity-80 leading-relaxed">Designate your survey site (trailhead, wetlands, ridge) and record GPS coordinates.</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            isSunlightMode ? 'bg-gray-50 border-gray-300' : 'bg-forest-950/80 border-forest-800'
          }`}>
            <div className="font-bold text-feather-yellow mb-1">2. Sample Continuously</div>
            <div className="opacity-80 leading-relaxed">Capture multiple 3-second acoustic recordings across the site as calls sound.</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            isSunlightMode ? 'bg-gray-50 border-gray-300' : 'bg-forest-950/80 border-forest-800'
          }`}>
            <div className="font-bold text-feather-yellow mb-1">3. Live Checklist Tally</div>
            <div className="opacity-80 leading-relaxed">BirdNET v2.4 aggregates detections, tallies frequency, and tracks peak confidence.</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            isSunlightMode ? 'bg-gray-50 border-gray-300' : 'bg-forest-950/80 border-forest-800'
          }`}>
            <div className="font-bold text-feather-yellow mb-1">4. Export CSV Survey</div>
            <div className="opacity-80 leading-relaxed">Download standard RFC 4180 CSV surveys ready for conservation data repositories.</div>
          </div>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-5 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-100'
        }`}>
          <div className="w-9 h-9 rounded-lg bg-forest-800 text-feather-yellow flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm mb-1.5">Zero Signal Required</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            True wilderness has no 5G bars. Open-weight models running on WebAssembly ensure your field recorder never fails deep in the backcountry.
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-100'
        }`}>
          <div className="w-9 h-9 rounded-lg bg-forest-800 text-feather-yellow flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm mb-1.5">BirdNET v2.4 Core (6,522 Species)</h3>
          <p className="text-xs opacity-80 leading-relaxed">
            No API keys. No monthly token billing. Audio never leaves your device. Audio is classified 100% on-device by BirdNET v2.4 ONNX across 6,522 real bird species.
          </p>
        </div>

        <div className={`p-5 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-100'
        }`}>
          <div className="w-9 h-9 rounded-lg bg-forest-800 text-feather-yellow flex items-center justify-center mb-3">
            <Sun className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm mb-1.5">Outdoor-First UX</h3>
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
        <ul className="space-y-2.5 text-xs opacity-90 leading-relaxed">
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
