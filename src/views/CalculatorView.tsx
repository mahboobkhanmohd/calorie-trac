import React, { useState, useEffect } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { calculateNutritionTargets } from '../utils/calculator';
import { ActivityLevel, ObjectiveGoal } from '../types/nutrition';
import {
  CheckCircle,
  Armchair,
  Footprints,
  Dumbbell,
  Zap,
  Flame,
  TrendingDown,
  Equal,
  TrendingUp,
  Save,
  Check,
  ShieldAlert,
  FlameKindling
} from 'lucide-react';

export const CalculatorView: React.FC = () => {
  const { profile, updateProfile, showToast, setActiveTab } = useNutrition();

  const [age, setAge] = useState<number>(profile.age || 28);
  const [sex, setSex] = useState<'male' | 'female'>(profile.sex || 'male');
  const [heightFt, setHeightFt] = useState<number>(profile.heightFt || 5);
  const [heightIn, setHeightIn] = useState<number>(profile.heightIn || 11);
  const [weightLbs, setWeightLbs] = useState<number>(profile.weightLbs || 175);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'moderate');
  const [activityMultiplier, setActivityMultiplier] = useState<number>(profile.activityMultiplier || 1.55);
  const [goal, setGoal] = useState<ObjectiveGoal>(profile.goal || 'fat_loss');
  const [goalDelta, setGoalDelta] = useState<number>(profile.goalDelta ?? -500);

  const [appliedRecently, setAppliedRecently] = useState(false);

  // Live calculation
  const results = calculateNutritionTargets({
    age,
    sex,
    heightFt,
    heightIn,
    weightLbs,
    activityMultiplier,
    goalDelta
  });

  const totalInches = heightFt * 12 + heightIn;
  const heightCm = Math.round(totalInches * 2.54);
  const weightKg = Math.round(weightLbs * 0.45359237 * 10) / 10;

  const handleApplyToProfile = () => {
    updateProfile({
      age,
      sex,
      heightFt,
      heightIn,
      heightCm,
      weightLbs,
      weightKg,
      activityLevel,
      activityMultiplier,
      goal,
      goalDelta,
      targetCalories: results.targetCalories,
      targetProtein: results.proteinG,
      targetCarbs: results.carbsG,
      targetFiber: results.fiberG,
      targetFat: results.fatG
    });

    setAppliedRecently(true);
    showToast(`Targets synchronized: ${results.targetCalories} kcal · P: ${results.proteinG}g · C: ${results.carbsG}g · F: ${results.fatG}g`);
    setTimeout(() => setAppliedRecently(false), 3000);
  };

  const activityOptions: {
    id: ActivityLevel;
    title: string;
    description: string;
    multiplier: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'sedentary',
      title: 'Sedentary',
      description: 'Desk bound, minimal baseline movement',
      multiplier: 1.2,
      icon: <Armchair className="w-5 h-5 text-[#8C8C8E]" />
    },
    {
      id: 'light',
      title: 'Light Exercise',
      description: '1-3 sessions / week of aerobic conditioning',
      multiplier: 1.375,
      icon: <Footprints className="w-5 h-5 text-[#8C8C8E]" />
    },
    {
      id: 'moderate',
      title: 'Moderate',
      description: '3-5 days / week lifting & cardio',
      multiplier: 1.55,
      icon: <Dumbbell className="w-5 h-5 text-[#FF6B4A]" />
    },
    {
      id: 'very_active',
      title: 'Very Active',
      description: '6-7 days intense athletic endurance',
      multiplier: 1.725,
      icon: <Zap className="w-5 h-5 text-[#8C8C8E]" />
    }
  ];

  const goalOptions: {
    id: ObjectiveGoal;
    title: string;
    description: string;
    delta: number;
    badgeText: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'fat_loss',
      title: 'Fat Oxidation',
      description: 'Controlled deficit for sustained adipocyte reduction',
      delta: -500,
      badgeText: '-500 kcal',
      icon: <TrendingDown className="w-5 h-5 text-[#FF6B4A]" />,
      color: '#FF6B4A'
    },
    {
      id: 'maintenance',
      title: 'Equilibrium',
      description: 'Homeostatic balance and athletic maintenance',
      delta: 0,
      badgeText: '0 kcal',
      icon: <Equal className="w-5 h-5 text-[#4D8DFF]" />,
      color: '#4D8DFF'
    },
    {
      id: 'hypertrophy',
      title: 'Hypertrophy',
      description: 'Anabolic surplus focused on myofibrillar gain',
      delta: 300,
      badgeText: '+300 kcal',
      icon: <TrendingUp className="w-5 h-5 text-[#9B7BFF]" />,
      color: '#9B7BFF'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16 select-none">
      {/* Top Micro Telemetry Strip & Overline */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse" />
            <span className="font-display text-xs uppercase tracking-widest text-[#8C8C8E]">
              Metabolic Model / M-St Jeor Algorithm v4.2
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#F5F3EE] tracking-tight">
            Precision Metabolic Intake Synthesizer
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#121214] px-4 py-2 rounded-full border border-white/[0.08] self-start md:self-auto">
          <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
            Telemetry Status:
          </span>
          <span className="font-display text-xs text-[#4D8DFF] flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> Calibrated
          </span>
        </div>
      </div>

      {/* Main Grid: Parameters Engine vs Results Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: Parameters Input Engine (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#19191C] rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/[0.08] flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF6B4A]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Section 01 */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h2 className="font-display font-bold text-base text-[#F5F3EE]">
                01 // Biometric Matrix
              </h2>
              <span className="font-display text-xs text-[#8C8C8E] uppercase tracking-wider">
                SI / Imperial Dual Sync
              </span>
            </div>

            {/* Age & Sex Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age Field */}
              <div className="bg-[#121214] rounded-2xl p-4 flex flex-col justify-between border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="input-age" className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                    Chronological Age
                  </label>
                  <span className="font-display text-xs font-semibold text-[#FF6B4A]">YEARS</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    id="input-age"
                    type="number"
                    min="15"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 28)}
                    className="bg-transparent font-display font-bold text-4xl text-[#F5F3EE] focus:outline-none w-28 tracking-tight"
                  />
                  <span className="text-xs text-[#8C8C8E]">yrs</span>
                </div>
              </div>

              {/* Biological Sex Switch */}
              <div className="bg-[#121214] rounded-2xl p-4 flex flex-col justify-between border border-white/[0.06]">
                <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E] mb-2 block">
                  Biological Sex
                </span>
                <div className="grid grid-cols-2 gap-1.5 bg-[#19191C] p-1 rounded-full border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setSex('male')}
                    className={`py-2 rounded-full font-display text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sex === 'male'
                        ? 'bg-[#212125] text-[#F5F3EE] shadow-sm border border-white/[0.1]'
                        : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                    }`}
                  >
                    <span>Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex('female')}
                    className={`py-2 rounded-full font-display text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      sex === 'female'
                        ? 'bg-[#212125] text-[#F5F3EE] shadow-sm border border-white/[0.1]'
                        : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                    }`}
                  >
                    <span>Female</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stature & Mass */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stature Input */}
              <div className="bg-[#121214] rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                    Stature / Height
                  </label>
                  <span className="text-xs text-[#8C8C8E] font-display">{heightCm} cm</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={heightFt}
                      onChange={(e) => setHeightFt(parseInt(e.target.value) || 5)}
                      className="bg-transparent font-display font-bold text-3xl text-[#F5F3EE] focus:outline-none w-14"
                    />
                    <span className="text-xs text-[#8C8C8E]">ft</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightIn}
                      onChange={(e) => setHeightIn(parseInt(e.target.value) || 0)}
                      className="bg-transparent font-display font-bold text-3xl text-[#F5F3EE] focus:outline-none w-14"
                    />
                    <span className="text-xs text-[#8C8C8E]">in</span>
                  </div>
                </div>
              </div>

              {/* Mass Input */}
              <div className="bg-[#121214] rounded-2xl p-4 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="input-mass" className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                    Current Body Mass
                  </label>
                  <span className="text-xs text-[#8C8C8E] font-display">{weightKg} kg</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    id="input-mass"
                    type="number"
                    min="60"
                    max="500"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(parseInt(e.target.value) || 175)}
                    className="bg-transparent font-display font-bold text-3xl text-[#F5F3EE] focus:outline-none w-28 tracking-tight"
                  />
                  <span className="text-xs text-[#8C8C8E]">lbs</span>
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-base text-[#F5F3EE]">
                  02 // Weekly Physical Expenditure
                </h3>
                <span className="font-display text-xs text-[#4D8DFF] uppercase tracking-wider font-semibold">
                  PAL Coefficient: {activityMultiplier}x
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activityOptions.map((opt) => {
                  const isActive = activityMultiplier === opt.multiplier;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setActivityLevel(opt.id);
                        setActivityMultiplier(opt.multiplier);
                      }}
                      className={`text-left p-4 rounded-2xl transition-all flex items-start gap-3.5 cursor-pointer border ${
                        isActive
                          ? 'bg-[#212125] border-[#FF6B4A]/50 shadow-md'
                          : 'bg-[#121214] hover:bg-[#212125]/60 border-white/[0.04]'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-[#FF6B4A] text-[#101010]' : 'bg-[#19191C]'
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-xs text-[#F5F3EE]">
                            {opt.title}
                          </span>
                          {isActive && (
                            <span className="bg-[#FF6B4A]/20 text-[#FF6B4A] text-[9px] font-display font-bold px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#8C8C8E] mt-0.5 leading-snug">
                          {opt.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Strategic Objective */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-base text-[#F5F3EE]">
                  03 // Strategic Objective
                </h3>
                <span className="font-display text-xs text-[#FF6B4A] uppercase tracking-wider font-semibold">
                  Delta Variance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {goalOptions.map((opt) => {
                  const isActive = goalDelta === opt.delta;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setGoal(opt.id);
                        setGoalDelta(opt.delta);
                      }}
                      className={`p-4 rounded-2xl text-left flex flex-col gap-1.5 transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-[#212125] border-white/[0.2] shadow-md'
                          : 'bg-[#121214] hover:bg-[#212125]/60 border-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        {opt.icon}
                        <span
                          className="font-display text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${opt.color}20`,
                            color: opt.color
                          }}
                        >
                          {opt.badgeText}
                        </span>
                      </div>
                      <span className="font-display font-bold text-xs text-[#F5F3EE]">
                        {opt.title}
                      </span>
                      <span className="text-[11px] text-[#8C8C8E] leading-snug">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual Environmental Slice */}
          <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#19191C] shadow-lg border border-white/[0.08]">
            <img
              src="/src/assets/images/lab_metabolic_telemetry_1790400616802.jpg"
              alt="Metabolic lab background"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C] via-[#121214]/80 to-transparent flex items-center p-6">
              <div className="max-w-md flex flex-col gap-1">
                <span className="font-display text-[10px] uppercase tracking-widest text-[#FF6B4A] font-bold">
                  Cellular Efficiency Engine
                </span>
                <p className="text-xs text-[#e5e2e1] leading-relaxed">
                  CALORA calculates baseline basal expenditure using body geometry variables coupled with localized metabolic thermogenesis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Dramatic Results Card & Macro Blueprint (5 Columns) */}
        <section className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="bg-[#19191C] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 border border-white/[0.08]">
            {/* Background Radiation Glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#FF6B4A]/15 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#4D8DFF]/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Overline Badge */}
            <div className="flex items-center justify-between">
              <span className="bg-[#FF6B4A]/20 text-[#FF6B4A] px-3.5 py-1 rounded-full font-display text-[10px] uppercase tracking-wider flex items-center gap-1.5 font-bold border border-[#FF6B4A]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] animate-ping" />
                ESTIMATED DAILY METABOLIC TARGET
              </span>
              <span className="font-display text-[10px] text-[#8C8C8E] uppercase tracking-widest">
                ISO-9001
              </span>
            </div>

            {/* Readout */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-5xl sm:text-6xl text-[#F5F3EE] tracking-tight">
                  {results.targetCalories.toLocaleString()}
                </span>
                <span className="font-display font-bold text-lg text-[#FF6B4A] tracking-wider uppercase">
                  KCAL / DAY
                </span>
              </div>
              <p className="text-xs text-[#8C8C8E] mt-1 leading-relaxed">
                Target calibrated for steady fat oxidation while preventing lean sarcoplasmic loss.
              </p>
            </div>

            {/* Secondary Breakdown Trio */}
            <div className="grid grid-cols-3 gap-2 bg-[#121214] p-3.5 rounded-2xl border border-white/[0.06]">
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-[#8C8C8E] uppercase">BMR Baseline</span>
                <span className="font-display text-base font-bold text-[#F5F3EE] mt-0.5">
                  {results.bmr.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8C8C8E]">kcal / day</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-[#8C8C8E] uppercase">Active TDEE</span>
                <span className="font-display text-base font-bold text-[#4D8DFF] mt-0.5">
                  {results.tdee.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#8C8C8E]">expenditure</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[10px] text-[#8C8C8E] uppercase">Strategy Delta</span>
                <span className="font-display text-base font-bold text-[#FF6B4A] mt-0.5">
                  {goalDelta > 0 ? `+${goalDelta}` : goalDelta}
                </span>
                <span className="text-[10px] text-[#8C8C8E]">cal flux</span>
              </div>
            </div>

            {/* Macronutrient Ratio Segmented Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider">
                <span className="text-[#8C8C8E]">Macronutrient Ratio Split</span>
                <span className="text-[#F5F3EE] font-bold">25P · 45C · 30F</span>
              </div>
              <div className="w-full h-3 bg-[#121214] rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-white/[0.04]">
                <div className="h-full bg-[#4D8DFF] rounded-l-full transition-all duration-500" style={{ width: '25%' }} />
                <div className="h-full bg-[#FF6B4A] transition-all duration-500" style={{ width: '45%' }} />
                <div className="h-full bg-white/80 rounded-r-full transition-all duration-500" style={{ width: '30%' }} />
              </div>
            </div>

            {/* Recommended Macro Cards */}
            <div className="flex flex-col gap-2">
              {/* Protein */}
              <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full bg-[#4D8DFF]" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-[#F5F3EE]">PROTEIN</span>
                      <span className="font-display text-[10px] bg-[#4D8DFF]/20 text-[#AEC6FF] px-2 py-0.2 rounded-full font-semibold">
                        25%
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8E]">Optimal for lean muscle preservation</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display font-bold text-lg text-[#F5F3EE]">
                      {results.proteinG}
                    </span>
                    <span className="text-xs text-[#8C8C8E]">g</span>
                  </div>
                  <span className="text-[11px] text-[#4D8DFF] font-medium">{results.proteinKcal} kcal</span>
                </div>
              </div>

              {/* Carbs */}
              <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full bg-[#FF6B4A]" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-[#F5F3EE]">CARBS</span>
                      <span className="font-display text-[10px] bg-[#FF6B4A]/20 text-[#FFB4A3] px-2 py-0.2 rounded-full font-semibold">
                        45%
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8E]">Sustained cognitive &amp; workout energy</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display font-bold text-lg text-[#F5F3EE]">
                      {results.carbsG}
                    </span>
                    <span className="text-xs text-[#8C8C8E]">g</span>
                  </div>
                  <span className="text-[11px] text-[#FF6B4A] font-medium">{results.carbsKcal} kcal</span>
                </div>
              </div>

              {/* Fiber */}
              <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full bg-[#9B7BFF]" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-[#F5F3EE]">FIBER</span>
                      <span className="font-display text-[10px] bg-[#9B7BFF]/20 text-[#CDBDFF] px-2 py-0.2 rounded-full font-semibold">
                        Essential
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8E]">Digestive health &amp; satiety threshold</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display font-bold text-lg text-[#F5F3EE]">
                      {results.fiberG}
                    </span>
                    <span className="text-xs text-[#8C8C8E]">g</span>
                  </div>
                  <span className="text-[11px] text-[#9B7BFF] font-medium">Micronutrient floor</span>
                </div>
              </div>

              {/* Fat */}
              <div className="p-3.5 rounded-2xl bg-[#121214] border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-10 rounded-full bg-white/80" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-xs text-[#F5F3EE]">FAT</span>
                      <span className="font-display text-[10px] bg-white/10 text-white px-2 py-0.2 rounded-full font-semibold">
                        30%
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C8C8E]">Hormonal baseline &amp; fatty acids</span>
                  </div>
                </div>
                <div className="text-right flex flex-col">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display font-bold text-lg text-[#F5F3EE]">
                      {results.fatG}
                    </span>
                    <span className="text-xs text-[#8C8C8E]">g</span>
                  </div>
                  <span className="text-[11px] text-white/70 font-medium">{results.fatKcal} kcal</span>
                </div>
              </div>
            </div>

            {/* Commit Button */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyToProfile}
                className="w-full py-4 px-6 rounded-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display text-sm font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_32px_rgba(255,107,74,0.6)] transition-all duration-300 transform active:scale-[0.98] cursor-pointer"
              >
                {appliedRecently ? <Check className="w-5 h-5 stroke-[3]" /> : <Save className="w-5 h-5" />}
                <span>{appliedRecently ? 'Target Synchronized!' : 'Apply Target to My Profile'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="text-center py-1 text-xs text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors cursor-pointer"
              >
                Return to Dashboard Overview →
              </button>
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div className="bg-[#19191C] rounded-2xl p-5 shadow-lg border border-white/[0.06] flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-[#8C8C8E] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-display text-xs uppercase tracking-wider text-[#F5F3EE] font-bold">
                Clinical &amp; Nutritional Protocol Disclaimer
              </span>
              <p className="text-xs text-[#8C8C8E] leading-relaxed">
                Disclaimer: Calorie and macronutrient estimates are calculated via Mifflin-St Jeor formulas and are approximations for guidance only. They do not constitute medical or clinical dietary advice. Consult a registered dietitian or healthcare provider before major nutritional changes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
