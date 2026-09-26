import React from 'react';
import { useNutrition } from '../context/NutritionContext';

export const Footer: React.FC = () => {
  const { setActiveTab } = useNutrition();

  return (
    <footer className="w-full bg-[#121214] py-8 mt-12 border-t border-white/[0.06] shadow-[0_-1px_8px_rgba(0,0,0,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 relative flex items-center justify-center">
            <svg className="w-6 h-6 -rotate-45" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#212125" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#FF6B4A"
                strokeWidth="3.5"
                strokeDasharray="45, 100"
                strokeLinecap="round"
              />
              <circle cx="18" cy="18" r="4.5" fill="#FF6B4A" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm uppercase text-[#F5F3EE] tracking-wide">
            CALORA
          </span>
          <span className="text-xs text-[#8C8C8E] ml-2 hidden sm:inline">
            Precision Metabolic Intelligence
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className="font-display text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors cursor-pointer"
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className="font-display text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors cursor-pointer"
          >
            Insights &amp; Support
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className="font-display text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors cursor-pointer"
          >
            Telemetry
          </button>
        </div>

        <div className="text-xs text-[#8C8C8E]">
          © {new Date().getFullYear()} CALORA Inc. Precision Nutritional Architecture.
        </div>
      </div>
    </footer>
  );
};
