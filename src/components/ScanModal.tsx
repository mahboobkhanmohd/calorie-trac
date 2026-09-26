import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Camera, X, Check, Sparkles, QrCode } from 'lucide-react';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'camera' | 'barcode';
}

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, mode = 'camera' }) => {
  const { addFoodEntry, selectedDate } = useNutrition();
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedPlate, setDetectedPlate] = useState<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fiber: number;
    fat: number;
    confidence: number;
    image: string;
  } | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      name: 'Artisanal Greek Yogurt Bowl + Berries',
      calories: 420,
      protein: 28,
      carbs: 54,
      fiber: 6,
      fat: 8,
      confidence: 98.4,
      image: '/src/assets/images/meal_greek_yogurt_1790400580799.jpg'
    },
    {
      name: 'Grilled Chicken Quinoa Bowl + Greens',
      calories: 680,
      protein: 48,
      carbs: 72,
      fiber: 8,
      fat: 18,
      confidence: 96.8,
      image: '/src/assets/images/meal_chicken_bowl_1790400592765.jpg'
    },
    {
      name: 'Wild Alaskan Salmon + Roasted Vegetables',
      calories: 560,
      protein: 42,
      carbs: 44,
      fiber: 7,
      fat: 22,
      confidence: 99.1,
      image: '/src/assets/images/meal_salmon_dinner_1790400604267.jpg'
    }
  ];

  const handleSimulateScan = (presetIndex: number) => {
    setAnalyzing(true);
    setDetectedPlate(null);
    setTimeout(() => {
      setAnalyzing(false);
      setDetectedPlate(presets[presetIndex]);
    }, 900);
  };

  const handleCommitDetected = () => {
    if (!detectedPlate) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addFoodEntry({
      date: selectedDate,
      time: timeStr,
      foodName: detectedPlate.name,
      meal: 'Lunch',
      serving: 1.0,
      calories: detectedPlate.calories,
      protein: detectedPlate.protein,
      carbs: detectedPlate.carbs,
      fiber: detectedPlate.fiber,
      fat: detectedPlate.fat,
      image: detectedPlate.image
    });

    onClose();
    setDetectedPlate(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#19191C] border border-white/[0.1] rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FF6B4A]/20 flex items-center justify-center text-[#FF6B4A]">
              {mode === 'camera' ? <Camera className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-[#F5F3EE]">
                {mode === 'camera' ? 'AI Plate Lens Telemetry' : 'Biometric Barcode Scanner'}
              </h3>
              <p className="text-xs text-[#8C8C8E]">Computer vision nutritional breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#121214] flex items-center justify-center text-[#8C8C8E] hover:text-[#F5F3EE]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative my-4 h-52 bg-[#0B0B0C] rounded-xl overflow-hidden border border-white/[0.08] flex items-center justify-center">
          {detectedPlate ? (
            <img
              src={detectedPlate.image}
              alt="Detected plate"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center p-4">
              <div className="relative w-20 h-20 border-2 border-dashed border-[#FF6B4A]/60 rounded-xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-[#FF6B4A] animate-pulse" />
                <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-[#FF6B4A]" />
                <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-[#FF6B4A]" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-[#FF6B4A]" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-[#FF6B4A]" />
              </div>
              <span className="font-display text-xs text-[#8C8C8E]">
                {analyzing ? 'Synthesizing volumetric macro vectors...' : 'Align meal plate or package within reticle'}
              </span>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 bg-[#0B0B0C]/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-[#FF6B4A] animate-spin" />
              <span className="font-display text-xs text-[#F5F3EE]">Analyzing density &amp; ingredients...</span>
            </div>
          )}
        </div>

        {/* Plate detected card */}
        {detectedPlate ? (
          <div className="bg-[#121214] p-3.5 rounded-xl border border-white/[0.08] mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-sm text-[#F5F3EE]">
                {detectedPlate.name}
              </span>
              <span className="text-[10px] font-display text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {detectedPlate.confidence}% Match
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-[#19191C] p-2 rounded-lg">
                <div className="text-[10px] text-[#8C8C8E]">Cals</div>
                <div className="font-bold text-[#FF6B4A]">{detectedPlate.calories}</div>
              </div>
              <div className="bg-[#19191C] p-2 rounded-lg">
                <div className="text-[10px] text-[#4D8DFF]">Protein</div>
                <div className="font-bold text-[#AEC6FF]">{detectedPlate.protein}g</div>
              </div>
              <div className="bg-[#19191C] p-2 rounded-lg">
                <div className="text-[10px] text-[#FF6B4A]">Carbs</div>
                <div className="font-bold text-[#FFB4A3]">{detectedPlate.carbs}g</div>
              </div>
              <div className="bg-[#19191C] p-2 rounded-lg">
                <div className="text-[10px] text-[#9B7BFF]">Fiber</div>
                <div className="font-bold text-[#CDBDFF]">{detectedPlate.fiber}g</div>
              </div>
              <div className="bg-[#19191C] p-2 rounded-lg">
                <div className="text-[10px] text-[#F5F3EE]">Fat</div>
                <div className="font-bold text-white">{detectedPlate.fat}g</div>
              </div>
            </div>
            <button
              onClick={handleCommitDetected}
              className="mt-3 w-full bg-[#FF6B4A] text-[#101010] py-2.5 rounded-full font-display font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#ff7a5c]"
            >
              <Check className="w-4 h-4" />
              <span>Confirm &amp; Log to Daily Journal</span>
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-[11px] font-display text-[#8C8C8E] uppercase tracking-wider block mb-2">
              Select Sample Camera Capture
            </span>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={p.name}
                  onClick={() => handleSimulateScan(idx)}
                  className="bg-[#121214] hover:bg-[#212125] border border-white/[0.06] p-2 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-14 object-cover rounded-lg mb-1.5"
                  />
                  <div className="font-display font-medium text-[11px] text-[#F5F3EE] truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-[#FF6B4A]">{p.calories} kcal</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
