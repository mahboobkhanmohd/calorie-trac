import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { OrbitalShader } from '../components/OrbitalShader';
import { ScanModal } from '../components/ScanModal';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Dumbbell,
  Zap,
  Droplets,
  Hourglass,
  Plus,
  Camera,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Egg,
  Wheat,
  Flower2,
  Droplet
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    profile,
    selectedDate,
    previousDay,
    nextDay,
    canGoNext,
    selectedDateTotals,
    selectedDateEntries,
    waterIntakeToday,
    addWater,
    setIsAddModalOpen,
    setActiveTab,
    setSelectedMealForAdd
  } = useNutrition();

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'barcode'>('camera');

  // Format date display (e.g. "TODAY, OCT 24" or "WED, OCT 23")
  const dateFormatted = React.useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const [y, m, d] = selectedDate.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);

    const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = targetDate.getDate();

    if (selectedDate === todayStr) {
      return `TODAY, ${monthName} ${dayNum}`;
    }
    const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${weekday}, ${monthName} ${dayNum}`;
  }, [selectedDate]);

  // Calories and calculations
  const consumedCalories = selectedDateTotals.calories;
  const targetCalories = profile.targetCalories;
  const remainingCalories = targetCalories - consumedCalories;
  const caloriePercent = Math.min(100, Math.round((consumedCalories / targetCalories) * 100));

  // Circular progress ring math (2 * PI * 45 = 282.74)
  const ringCircumference = 282.74;
  const ringOffset = ringCircumference * (1 - Math.min(1, consumedCalories / targetCalories));

  // Macros
  const proteinConsumed = selectedDateTotals.protein;
  const carbsConsumed = selectedDateTotals.carbs;
  const fiberConsumed = selectedDateTotals.fiber;
  const fatConsumed = selectedDateTotals.fat;

  const proteinTarget = profile.targetProtein;
  const carbsTarget = profile.targetCarbs;
  const fiberTarget = profile.targetFiber;
  const fatTarget = profile.targetFat;

  const proteinPercent = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));
  const carbsPercent = Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100));
  const fiberPercent = Math.min(100, Math.round((fiberConsumed / fiberTarget) * 100));
  const fatPercent = Math.min(100, Math.round((fatConsumed / fatTarget) * 100));

  // Water
  const waterGoal = profile.waterGoalMl || 3000;
  const waterPercent = Math.min(100, Math.round((waterIntakeToday / waterGoal) * 100));
  const waterRemaining = Math.max(0, waterGoal - waterIntakeToday);

  // Status message
  const statusMessage =
    remainingCalories >= 0
      ? `ON TRACK (+${remainingCalories.toLocaleString()} KCAL LEFT)`
      : `SURPLUS (${Math.abs(remainingCalories).toLocaleString()} KCAL OVER)`;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 gap-6 select-none pb-28 md:pb-16">
      {/* Top Control Bar: Date Selector & Status Indicator */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121214] p-3 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            onClick={previousDay}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#19191C] text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#212125] transition-colors cursor-pointer"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#19191C] rounded-xl border border-white/[0.04]">
            <Calendar className="w-4 h-4 text-[#FF6B4A]" />
            <span className="font-display font-bold text-sm text-[#F5F3EE] tracking-wider uppercase">
              {dateFormatted}
            </span>
          </div>
          <button
            onClick={nextDay}
            disabled={!canGoNext}
            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-[#19191C] transition-colors cursor-pointer ${
              canGoNext
                ? 'text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#212125]'
                : 'text-white/20 cursor-not-allowed'
            }`}
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#212125] border border-white/[0.08] shadow-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                remainingCalories >= 0 ? 'bg-[#FF6B4A] animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-display text-xs text-[#F5F3EE] tracking-widest uppercase">
              METABOLIC STATUS:
            </span>
            <span className="font-display text-xs text-[#FF6B4A] font-bold uppercase tracking-wider">
              {statusMessage}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('calculator')}
            className="hidden lg:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#19191C] text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#212125] font-display text-xs transition-all cursor-pointer border border-white/[0.04]"
          >
            <Zap className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Target: {targetCalories.toLocaleString()}</span>
          </button>
        </div>
      </header>

      {/* Central Visual Console: Energy Hero & Precision Telemetry */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Huge Hero Nutrition-Energy Orb Card (Col 8) */}
        <div className="lg:col-span-8 bg-[#19191C] rounded-2xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/[0.08] min-h-[460px]">
          {/* Ambient Radiation Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#FF6B4A]/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-[#4D8DFF]/10 blur-[90px] pointer-events-none" />

          {/* Top Row Labels */}
          <div className="flex items-center justify-between z-10 w-full">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#212125] font-display text-xs text-[#8C8C8E] uppercase tracking-widest border border-white/[0.06]">
                Orbital Dynamics
              </span>
              <span className="text-xs text-[#8C8C8E]">Dynamic Balance</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#121214] font-display text-xs text-[#F5F3EE] border border-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-[#4D8DFF] animate-pulse" />
              <span>Basal Sync Active</span>
            </div>
          </div>

          {/* Main Focal Orb & Stat Cluster */}
          <div className="relative flex flex-col md:flex-row items-center justify-around my-6 z-10 gap-6">
            {/* Interactive WebGL Shader Orb Container */}
            <div className="relative w-64 h-64 flex items-center justify-center shrink-0">
              <OrbitalShader percentage={caloriePercent} className="w-64 h-64 mx-auto rounded-full" />

              {/* Circular Progress Ring Overlay */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  className="text-white/10"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <circle
                  className="text-[#FF6B4A] transition-all duration-700"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray="282.74"
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>

              {/* Floating Badge Anchored to Orb */}
              <div className="absolute -bottom-2 bg-[#121214]/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-white/[0.1] flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF6B4A]" />
                <span className="font-display font-bold text-xs text-[#F5F3EE]">
                  {caloriePercent}% OF TARGET
                </span>
              </div>
            </div>

            {/* Dominant Oversized Typography Cluster */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left z-10">
              <span className="font-display text-xs uppercase tracking-widest text-[#8C8C8E]">
                Total Calories Consumed
              </span>
              <div className="flex items-baseline gap-2 my-1">
                <span className="font-display font-bold text-5xl sm:text-6xl text-[#F5F3EE] tracking-tight">
                  {consumedCalories.toLocaleString()}
                </span>
                <span className="font-display font-bold text-xl text-[#FF6B4A] uppercase">
                  kcal
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                <div className="flex justify-between items-center text-xs text-[#8C8C8E]">
                  <span>{remainingCalories >= 0 ? 'Remaining Deficit Cap' : 'Calorie Surplus'}</span>
                  <span className="font-display text-sm text-[#F5F3EE] font-bold">
                    {Math.abs(remainingCalories).toLocaleString()} kcal
                  </span>
                </div>
                <div className="w-full bg-[#121214] h-2.5 rounded-full overflow-hidden p-0.5 border border-white/[0.06]">
                  <div
                    className="bg-[#FF6B4A] h-full rounded-full transition-all duration-700"
                    style={{ width: `${caloriePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[#8C8C8E] font-display text-xs uppercase tracking-wider">
                  <span>Goal: {targetCalories.toLocaleString()}</span>
                  <span className="text-[#FF6B4A] font-semibold">
                    TDEE: {(targetCalories - profile.goalDelta).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Split Pill Telemetry Dock */}
          <div className="z-10 grid grid-cols-2 gap-3 bg-[#121214] p-1.5 rounded-2xl border border-white/[0.06]">
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-[#19191C] rounded-xl border border-white/[0.04]">
              <Dumbbell className="w-4 h-4 text-[#4D8DFF]" />
              <span className="font-display text-xs text-[#8C8C8E] uppercase tracking-wider">Active Burn:</span>
              <span className="font-display text-sm font-bold text-[#F5F3EE]">520</span>
              <span className="text-xs text-[#8C8C8E]">kcal</span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-[#19191C] rounded-xl border border-white/[0.04]">
              <Zap className="w-4 h-4 text-[#9B7BFF]" />
              <span className="font-display text-xs text-[#8C8C8E] uppercase tracking-wider">Net Intake:</span>
              <span className="font-display text-sm font-bold text-[#F5F3EE]">
                {Math.max(0, consumedCalories - 520).toLocaleString()}
              </span>
              <span className="text-xs text-[#8C8C8E]">kcal</span>
            </div>
          </div>
        </div>

        {/* Right Auxiliary Column: Hydration & Circadian Window (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Water Wave Hydration Telemetry */}
          <div className="bg-[#19191C] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/[0.08] flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#121214] flex items-center justify-center text-[#4D8DFF] border border-white/[0.06]">
                  <Droplets className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display text-xs text-[#8C8C8E] tracking-widest uppercase">
                    Cellular Hydration
                  </p>
                  <p className="font-display text-lg font-bold text-[#F5F3EE]">
                    {waterIntakeToday.toLocaleString()}{' '}
                    <span className="text-xs text-[#8C8C8E] font-normal">/ {waterGoal.toLocaleString()} ml</span>
                  </p>
                </div>
              </div>
              <span className="font-display text-xs px-2.5 py-1 rounded-full bg-[#0361d1]/30 text-[#AEC6FF] border border-[#4D8DFF]/30 font-semibold">
                {waterPercent}%
              </span>
            </div>

            {/* Graphic Water Vessel Simulation */}
            <div className="relative w-full h-32 my-4 bg-[#121214] rounded-xl overflow-hidden flex items-end border border-white/[0.06]">
              <div
                className="w-full bg-[#0361d1]/40 relative transition-all duration-700 flex flex-col justify-end"
                style={{ height: `${Math.max(15, waterPercent)}%` }}
              >
                <svg
                  className="w-full h-5 text-[#0361d1]/80 absolute top-0 left-0 -translate-y-full opacity-90"
                  preserveAspectRatio="none"
                  viewBox="0 0 1200 120"
                >
                  <path
                    d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z"
                    fill="currentColor"
                  />
                </svg>
                <div className="h-full w-full bg-gradient-to-t from-[#0361d1] to-[#0361d1]/70 flex items-center justify-center p-2">
                  <span className="font-display text-xs text-[#dbe4ff] font-bold tracking-wider text-center">
                    {waterRemaining > 0 ? `${waterRemaining} ML UNTIL HYDRATED` : 'OPTIMAL HYDRATION ATTAINED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hydration Quick Input Action Group */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => addWater(250)}
                className="py-2 rounded-xl bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] font-display text-xs font-semibold transition-colors text-center border border-white/[0.06] cursor-pointer"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => addWater(500)}
                className="py-2 rounded-xl bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] font-display text-xs font-semibold transition-colors text-center border border-white/[0.06] cursor-pointer"
              >
                +500ml
              </button>
              <button
                type="button"
                onClick={() => addWater(750)}
                className="py-2 rounded-xl bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] font-display text-xs font-semibold transition-colors text-center border border-white/[0.06] cursor-pointer"
              >
                +750ml
              </button>
            </div>
          </div>

          {/* Quick Fasting / Circadian Metabolic Window Card */}
          <div className="bg-[#19191C] rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#121214] flex items-center justify-center text-[#9B7BFF] border border-white/[0.06]">
                  <Hourglass className="w-5 h-5" />
                </span>
                <div>
                  <p className="font-display text-xs text-[#8C8C8E] tracking-widest uppercase">
                    Circadian Window
                  </p>
                  <p className="font-display text-lg font-bold text-[#F5F3EE]">
                    15h 20m <span className="text-xs text-[#9B7BFF] font-normal">Fasting</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#212125] font-display text-xs text-[#9B7BFF] uppercase border border-white/[0.06]">
                16:8 Protocol
              </span>
            </div>
            <div className="flex items-center justify-between mt-4 bg-[#121214] p-3 rounded-xl border border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse" />
                <span className="text-xs text-[#8C8C8E]">Eating Window Opens:</span>
              </div>
              <span className="font-display text-xs font-semibold text-[#F5F3EE]">12:30 PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Precision Macronutrient Section (4 High-Contrast Tactile Cards) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-sm uppercase text-[#F5F3EE] tracking-wider">
            Macro Architect Distribution
          </h2>
          <span className="font-display text-xs text-[#8C8C8E]">
            Target Ratios 25P / 45C / 30F
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. PROTEIN */}
          <div className="bg-[#19191C] rounded-2xl p-5 flex flex-col justify-between group hover:bg-[#212125] transition-all duration-300 shadow-xl border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4D8DFF]/20 flex items-center justify-center text-[#4D8DFF]">
                  <Egg className="w-4 h-4" />
                </div>
                <span className="font-display text-xs font-bold tracking-widest text-[#F5F3EE]">
                  PROTEIN
                </span>
              </div>
              <span className="font-display text-xs px-2 py-0.5 rounded-full bg-[#4D8DFF]/20 text-[#AEC6FF] font-bold">
                {proteinPercent}%
              </span>
            </div>
            <div className="my-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-[#F5F3EE]">
                  {Math.round(proteinConsumed)}
                </span>
                <span className="font-display text-xs text-[#8C8C8E]">/{proteinTarget}g</span>
              </div>
              <span className="text-xs text-[#8C8C8E]">
                {proteinTarget - proteinConsumed > 0
                  ? `${Math.round(proteinTarget - proteinConsumed)}g left`
                  : 'Goal reached'}
              </span>
            </div>
            <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#4D8DFF] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(77,141,255,0.6)]"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
          </div>

          {/* 2. CARBOHYDRATES */}
          <div className="bg-[#19191C] rounded-2xl p-5 flex flex-col justify-between group hover:bg-[#212125] transition-all duration-300 shadow-xl border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/20 flex items-center justify-center text-[#FF6B4A]">
                  <Wheat className="w-4 h-4" />
                </div>
                <span className="font-display text-xs font-bold tracking-widest text-[#F5F3EE]">
                  CARBS
                </span>
              </div>
              <span className="font-display text-xs px-2 py-0.5 rounded-full bg-[#FF6B4A]/20 text-[#FFB4A3] font-bold">
                {carbsPercent}%
              </span>
            </div>
            <div className="my-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-[#F5F3EE]">
                  {Math.round(carbsConsumed)}
                </span>
                <span className="font-display text-xs text-[#8C8C8E]">/{carbsTarget}g</span>
              </div>
              <span className="text-xs text-[#8C8C8E]">
                {carbsTarget - carbsConsumed > 0
                  ? `${Math.round(carbsTarget - carbsConsumed)}g left`
                  : 'Goal reached'}
              </span>
            </div>
            <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#FF6B4A] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,107,74,0.6)]"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
          </div>

          {/* 3. FIBER */}
          <div className="bg-[#19191C] rounded-2xl p-5 flex flex-col justify-between group hover:bg-[#212125] transition-all duration-300 shadow-xl border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#9B7BFF]/20 flex items-center justify-center text-[#9B7BFF]">
                  <Flower2 className="w-4 h-4" />
                </div>
                <span className="font-display text-xs font-bold tracking-widest text-[#F5F3EE]">
                  FIBER
                </span>
              </div>
              <span className="font-display text-xs px-2 py-0.5 rounded-full bg-[#9B7BFF]/20 text-[#CDBDFF] font-bold">
                {fiberPercent}%
              </span>
            </div>
            <div className="my-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-[#F5F3EE]">
                  {Math.round(fiberConsumed)}
                </span>
                <span className="font-display text-xs text-[#8C8C8E]">/{fiberTarget}g</span>
              </div>
              <span className="text-xs text-[#8C8C8E]">
                {fiberTarget - fiberConsumed > 0
                  ? `${Math.round(fiberTarget - fiberConsumed)}g left`
                  : 'Goal reached'}
              </span>
            </div>
            <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#9B7BFF] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(155,123,255,0.6)]"
                style={{ width: `${fiberPercent}%` }}
              />
            </div>
          </div>

          {/* 4. LIPIDS (FATS) */}
          <div className="bg-[#19191C] rounded-2xl p-5 flex flex-col justify-between group hover:bg-[#212125] transition-all duration-300 shadow-xl border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#F5F3EE]">
                  <Droplet className="w-4 h-4" />
                </div>
                <span className="font-display text-xs font-bold tracking-widest text-[#F5F3EE]">
                  LIPIDS (FATS)
                </span>
              </div>
              <span className="font-display text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                {fatPercent}%
              </span>
            </div>
            <div className="my-4 flex items-baseline justify-between">
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-[#F5F3EE]">
                  {Math.round(fatConsumed)}
                </span>
                <span className="font-display text-xs text-[#8C8C8E]">/{fatTarget}g</span>
              </div>
              <span className="text-xs text-[#8C8C8E]">
                {fatTarget - fatConsumed > 0
                  ? `${Math.round(fatTarget - fatConsumed)}g left`
                  : 'Goal reached'}
              </span>
            </div>
            <div className="w-full bg-[#121214] h-2 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-white/80 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Meals Timeline Preview & Biomarker Health Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Logged Meals Timeline (Col 8) */}
        <div className="lg:col-span-8 bg-[#19191C] rounded-2xl p-6 flex flex-col gap-4 shadow-2xl border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
              <h3 className="font-display font-bold text-sm uppercase text-[#F5F3EE] tracking-wide">
                Recent Logs Timeline
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('food-log')}
              className="font-display text-xs text-[#FF6B4A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All in Food Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Meals List */}
          <div className="flex flex-col gap-2.5">
            {selectedDateEntries.length === 0 ? (
              <div className="p-8 text-center bg-[#121214] rounded-xl border border-white/[0.04]">
                <p className="font-display text-sm text-[#F5F3EE] mb-1">No meals logged for this date.</p>
                <p className="text-xs text-[#8C8C8E] mb-4">Start your day by logging your first breakfast or snack.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-[#FF6B4A] text-[#101010] font-display text-xs font-bold rounded-full cursor-pointer hover:bg-[#ff7a5c]"
                >
                  + Add Food
                </button>
              </div>
            ) : (
              selectedDateEntries.slice(0, 4).map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#121214] rounded-xl gap-3 hover:bg-[#212125] transition-colors border border-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt={entry.foodName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-[#212125] shrink-0 border border-white/[0.06]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#212125] flex items-center justify-center text-[#FF6B4A] shrink-0 font-display text-sm font-bold border border-white/[0.06]">
                        {entry.meal[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[10px] px-2 py-0.5 rounded bg-[#212125] text-[#8C8C8E] uppercase">
                          {entry.time}
                        </span>
                        <span className="font-display text-xs font-bold text-[#F5F3EE]">
                          {entry.meal}
                        </span>
                      </div>
                      <p className="text-xs text-[#e5e2e1] mt-0.5 font-medium truncate max-w-xs sm:max-w-md">
                        {entry.foodName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 font-display text-[10px]">
                      <span className="text-[#AEC6FF] bg-[#212125] px-2 py-0.5 rounded border border-white/[0.04]">
                        P: {entry.protein}g
                      </span>
                      <span className="text-[#FFB4A3] bg-[#212125] px-2 py-0.5 rounded border border-white/[0.04]">
                        C: {entry.carbs}g
                      </span>
                      <span className="text-white/80 bg-[#212125] px-2 py-0.5 rounded border border-white/[0.04]">
                        F: {entry.fat}g
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-sm text-[#F5F3EE]">
                        {entry.calories}
                      </span>
                      <span className="text-[10px] text-[#8C8C8E] ml-1">kcal</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between pt-2 gap-3 border-t border-white/[0.06]">
            <button
              onClick={() => {
                setSelectedMealForAdd('Lunch');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6B4A] text-[#101010] font-display text-xs font-bold hover:shadow-[0_0_20px_rgba(255,107,74,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Quick Log Item</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setScanMode('camera');
                  setScanModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121214] hover:bg-[#212125] text-[#8C8C8E] hover:text-[#F5F3EE] font-display text-xs transition-colors border border-white/[0.06] cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span className="hidden sm:inline">AI Lens Scan</span>
              </button>
              <button
                onClick={() => {
                  setScanMode('barcode');
                  setScanModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121214] hover:bg-[#212125] text-[#8C8C8E] hover:text-[#F5F3EE] font-display text-xs transition-colors border border-white/[0.06] cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#4D8DFF]" />
                <span className="hidden sm:inline">Barcode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Biomarker Health (Col 4) */}
        <div className="lg:col-span-4 bg-[#19191C] rounded-2xl p-6 flex flex-col justify-between shadow-2xl border border-white/[0.08] min-h-[300px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                Biomarker Health Score
              </span>
              <span className="w-7 h-7 rounded-full bg-[#121214] flex items-center justify-center text-[#FF6B4A] border border-white/[0.06]">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            <div className="p-3.5 bg-[#121214] rounded-xl mb-3 border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-[10px] text-[#8C8C8E] uppercase">Sodium Load</p>
                  <p className="font-display text-sm font-bold text-[#F5F3EE]">
                    1,620 <span className="text-[11px] text-[#8C8C8E] font-normal">/ 2,300 mg</span>
                  </p>
                </div>
                <span className="font-display text-[10px] px-2 py-0.5 rounded bg-[#212125] text-[#4D8DFF] border border-[#4D8DFF]/20 font-semibold">
                  Optimal
                </span>
              </div>
              <div className="w-full bg-[#212125] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#4D8DFF] h-full rounded-full w-[70%]" />
              </div>
            </div>

            <div className="p-3.5 bg-[#121214] rounded-xl border border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-[10px] text-[#8C8C8E] uppercase">
                    Micronutrient Diversity
                  </p>
                  <p className="font-display text-sm font-bold text-[#F5F3EE]">
                    8.8 <span className="text-[11px] text-[#8C8C8E] font-normal">/ 10.0</span>
                  </p>
                </div>
                <span className="font-display text-[10px] px-2 py-0.5 rounded bg-[#212125] text-[#9B7BFF] border border-[#9B7BFF]/20 font-semibold">
                  High Vitality
                </span>
              </div>
              <div className="w-full bg-[#212125] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-[#9B7BFF] h-full rounded-full w-[88%]" />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#121214] flex items-center justify-between border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6B4A]" />
              <span className="font-display text-xs text-[#F5F3EE] font-medium">
                All Basal Targets Met
              </span>
            </div>
            <span className="font-display text-xs text-[#8C8C8E]">Day 14 Streak</span>
          </div>
        </div>
      </section>

      {/* AI Camera / Barcode scan modal */}
      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        mode={scanMode}
      />
    </div>
  );
};
