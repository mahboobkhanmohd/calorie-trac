import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useNutrition();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-2.5 bg-[#212125]/95 text-[#F5F3EE] px-4 py-3 rounded-2xl border border-white/[0.15] shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none">
      <CheckCircle2 className="w-4 h-4 text-[#FF6B4A] shrink-0" />
      <span className="font-display text-xs font-semibold">{toastMessage}</span>
    </div>
  );
};
