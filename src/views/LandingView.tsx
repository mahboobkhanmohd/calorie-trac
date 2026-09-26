import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import {
  Flame,
  Zap,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
  Radio,
  CheckCircle2,
  Droplets,
  Layers,
  ChevronRight
} from 'lucide-react';

interface LandingViewProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenLogin, onOpenSignup }) => {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Animated Gradient & Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF6B4A]/10 via-[#9B7BFF]/10 to-[#4D8DFF]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#FF6B4A]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Floating decorative nodes */}
      <div className="absolute top-36 left-12 w-2 h-2 rounded-full bg-[#FF6B4A]/40 animate-pulse pointer-events-none" />
      <div className="absolute top-64 right-20 w-3 h-3 rounded-full bg-[#4D8DFF]/30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 rounded-full bg-[#9B7BFF]/40 pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 flex flex-col items-center text-center">
        {/* Biometric Status Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#19191C] border border-white/10 text-xs font-display text-white/90 shadow-sm mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B4A]" />
          </span>
          <span className="font-semibold text-[#FF6B4A]">CALORA OS</span>
          <span className="text-white/40">|</span>
          <span className="text-white/70">Precision Metabolic Telemetry &amp; Live Voice AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-[#F5F3EE] tracking-tight max-w-4xl leading-[1.08]">
          Precision Metabolic <br />
          <span className="bg-gradient-to-r from-[#FF6B4A] via-[#FF8A65] to-[#4D8DFF] bg-clip-text text-transparent">
            Architecture &amp; Intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#8C8C8E] max-w-2xl leading-relaxed">
          CALORA integrates real-time caloric velocity, dynamic macro equilibrium, and Gemini 3.8 Live Voice coaching with cryptographically isolated cloud security.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onOpenSignup}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-sm tracking-wide shadow-xl shadow-[#FF6B4A]/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Initialize Account</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#19191C] hover:bg-[#212125] text-[#F5F3EE] border border-white/10 font-display font-semibold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer hover:border-white/25"
          >
            <span>Sign In to Vault</span>
            <ChevronRight className="w-4 h-4 text-[#8C8C8E]" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#8C8C8E] font-display font-medium">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#4D8DFF]" />
            <span>Strict User Data Isolation</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF6B4A]" />
            <span>Gemini 3.8 Live API Voice</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#9B7BFF]" />
            <span>Offline Queue &amp; Cloud Sync</span>
          </div>
        </div>

        {/* Interactive Dashboard Graphic Card */}
        <div className="mt-16 w-full max-w-4xl p-2 rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/10 shadow-2xl">
          <div className="bg-[#121214] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FF6B4A] bg-[#FF6B4A]/10 px-2.5 py-1 rounded-full border border-[#FF6B4A]/20">
                <Flame className="w-3.5 h-3.5" /> METABOLIC STATUS
              </div>
              <h3 className="font-display font-bold text-2xl text-[#F5F3EE]">
                Real-Time Energy Telemetry
              </h3>
              <p className="text-xs sm:text-sm text-[#8C8C8E] leading-relaxed">
                Log meals via Gemini 3.8 voice or instant search. Watch energy velocity calculate BMR, TDEE, protein synthesis, and cellular hydration with zero cross-tenant contamination.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-[#4D8DFF] uppercase font-bold block">Protein</span>
                  <span className="font-display font-bold text-lg text-white">140g</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-[#FF6B4A] uppercase font-bold block">Carbs</span>
                  <span className="font-display font-bold text-lg text-white">250g</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-[#9B7BFF] uppercase font-bold block">Fats</span>
                  <span className="font-display font-bold text-lg text-white">75g</span>
                </div>
              </div>
            </div>

            {/* Visual Ring Representation */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg className="w-44 h-44 -rotate-45" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#212125" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#FF6B4A"
                  strokeWidth="3.2"
                  strokeDasharray="65, 100"
                  strokeLinecap="round"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="10.5"
                  fill="none"
                  stroke="#4D8DFF"
                  strokeWidth="2.8"
                  strokeDasharray="45, 100"
                  strokeLinecap="round"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="7"
                  fill="none"
                  stroke="#9B7BFF"
                  strokeWidth="2.4"
                  strokeDasharray="30, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display font-bold text-2xl text-white">1,840</span>
                <span className="text-[10px] uppercase tracking-wider text-[#8C8C8E]">kcal consumed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pillar Grid */}
      <div className="border-t border-white/5 bg-[#121214]/60 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#19191C] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 flex items-center justify-center text-[#FF6B4A]">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-[#F5F3EE]">Enforced Data Isolation</h4>
              <p className="text-xs text-[#8C8C8E] leading-relaxed">
                Database access rules verify that each user can only read, write, and modify their own records. Zero client-side authorization trust.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#19191C] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#4D8DFF]/10 border border-[#4D8DFF]/20 flex items-center justify-center text-[#4D8DFF]">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-[#F5F3EE]">Gemini 3.8 Live Voice</h4>
              <p className="text-xs text-[#8C8C8E] leading-relaxed">
                Real-time bidirectional 16kHz/24kHz streaming audio coach. Ask metabolic questions, log meals conversationally, and analyze macros verbally.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#19191C] border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#9B7BFF]/10 border border-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-base text-[#F5F3EE]">Offline Queueing</h4>
              <p className="text-xs text-[#8C8C8E] leading-relaxed">
                Service Worker caches critical app shell assets while the offline synchronization queue buffers entries locally and drains to Cloud Firestore.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
