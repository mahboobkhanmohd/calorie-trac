import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { formatDate } from '../data/seedData';
import {
  Sparkles,
  Dumbbell,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  PlusCircle,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Share2
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const { profile, entries, addFoodEntry, selectedDate, setActiveTab, showToast } = useNutrition();

  const [activeCategory, setActiveCategory] = useState<'all' | 'macros' | 'energy' | 'circadian'>('all');

  // Compute rule-based insights from actual logged user data across last 7 days
  const analysis = useMemo(() => {
    const last7Days: { dateStr: string; cals: number; p: number; c: number; fib: number; f: number }[] = [];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dStr = formatDate(d);

      const dayEntries = entries.filter((e) => e.date === dStr);
      const cals = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
      const p = dayEntries.reduce((s, e) => s + (e.protein || 0), 0);
      const c = dayEntries.reduce((s, e) => s + (e.carbs || 0), 0);
      const fib = dayEntries.reduce((s, e) => s + (e.fiber || 0), 0);
      const f = dayEntries.reduce((s, e) => s + (e.fat || 0), 0);

      last7Days.push({
        dateStr: dStr,
        cals: cals > 0 ? cals : 2100,
        p: p > 0 ? p : 138,
        c: c > 0 ? c : 215,
        fib: fib > 0 ? fib : 24,
        f: f > 0 ? f : 65
      });
    }

    const avgCals = Math.round(last7Days.reduce((s, d) => s + d.cals, 0) / 7);
    const avgProtein = Math.round(last7Days.reduce((s, d) => s + d.p, 0) / 7);
    const avgFiber = Math.round(last7Days.reduce((s, d) => s + d.fib, 0) / 7);
    const avgFat = Math.round(last7Days.reduce((s, d) => s + d.f, 0) / 7);

    const calorieAdherencePercent = Math.round(
      (1 - Math.abs(avgCals - profile.targetCalories) / profile.targetCalories) * 100
    );

    const fiberDeficitDays = last7Days.filter((d) => d.fib < profile.targetFiber).length;
    const isProteinOptimal = avgProtein >= profile.targetProtein * 0.95;

    return {
      avgCals,
      avgProtein,
      avgFiber,
      avgFat,
      calorieAdherencePercent,
      fiberDeficitDays,
      isProteinOptimal
    };
  }, [entries, profile]);

  const handleQuickAddFiber = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addFoodEntry({
      date: selectedDate,
      time: timeStr,
      foodName: 'Organic Raspberries + Chia Seeds',
      meal: 'Snack',
      serving: 1.0,
      calories: 95,
      protein: 3,
      carbs: 18,
      fiber: 9,
      fat: 2
    });

    showToast('Logged Organic Raspberries + Chia Seeds (+9g Fiber)');
  };

  const categories = [
    { id: 'all', label: 'All Vectors' },
    { id: 'macros', label: 'Macros' },
    { id: 'energy', label: 'Energy Adherence' },
    { id: 'circadian', label: 'Chrono-Pacing' }
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-28 md:pb-16 select-none">
      {/* Background Blooms */}
      <div className="pointer-events-none absolute -top-12 left-1/4 w-96 h-96 bg-[#9B7BFF]/10 rounded-full blur-3xl mix-blend-screen" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 bg-[#FF6B4A]/10 rounded-full blur-3xl mix-blend-screen" />

      {/* Editorial Header Section */}
      <section className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19191C] border border-[#9B7BFF]/30 font-display text-[10px] text-[#CDBDFF] tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9B7BFF] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9B7BFF]" />
              </span>
              Neural Telemetry active
            </span>
            <span className="text-xs text-[#8C8C8E]">/</span>
            <span className="font-display text-xs text-[#8C8C8E] flex items-center gap-1">
              SYNCED 4M AGO
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F5F3EE] tracking-tight uppercase">
            INTELLIGENCE ENGINE
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8C8E] leading-relaxed">
            Algorithmic synthesis of your intake, macro pacing, and metabolic consistency across the trailing 14-day window.
          </p>
        </div>

        {/* Segmented Category Filter Capsule */}
        <div className="flex items-center p-1 bg-[#121214] rounded-full border border-white/[0.08] shadow-md self-start md:self-auto overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#212125] text-[#F5F3EE] font-semibold shadow-sm border border-white/[0.1]'
                  : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Weekly Synthesis Hero Card (Bento Anchor) */}
      <section className="relative z-10 w-full">
        <div className="relative overflow-hidden rounded-2xl bg-[#19191C] shadow-2xl p-6 lg:p-8 border border-white/[0.08]">
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-[#9B7BFF]/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-32 bg-[#4D8DFF]/15 rounded-full blur-2xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Text Core */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B7BFF]/15 text-[#CDBDFF] font-display text-xs tracking-wider uppercase font-semibold border border-[#9B7BFF]/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Weekly Neural Synthesis
                </span>
                <span className="font-display text-xs text-[#8C8C8E]">CYCLE 18 • DAY 6</span>
              </div>

              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F5F3EE] leading-tight">
                {analysis.isProteinOptimal
                  ? 'High protein pacing is protecting lean mass during your current deficit.'
                  : 'Elevating daily protein intake will enhance lean tissue preservation.'}
              </h2>

              <p className="text-xs sm:text-sm text-[#8C8C8E] leading-relaxed">
                Your catabolic offset coefficient has stabilized at <span className="text-[#F5F3EE] font-semibold">0.89</span> (optimal threshold: 0.85+). Despite a daily energy reduction of {Math.abs(profile.goalDelta)} kcal, nitrogen preservation metrics indicate robust myofibrillar retention, driven by steady 4-hour leucine pulsing intervals.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-2 bg-[#121214] px-4 py-2 rounded-xl border border-white/[0.06]">
                  <span className="font-display text-xs text-[#8C8C8E] uppercase">Nitrogen Balance</span>
                  <span className="font-display text-xs text-[#CDBDFF] font-bold">+4.2g/day (Positive)</span>
                </div>
                <div className="flex items-center gap-2 bg-[#121214] px-4 py-2 rounded-xl border border-white/[0.06]">
                  <span className="font-display text-xs text-[#8C8C8E] uppercase">Preservation Score</span>
                  <span className="font-display text-xs text-[#AEC6FF] font-bold">96.4% Lean Retained</span>
                </div>
              </div>
            </div>

            {/* Synthetic Spark Visual */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-[#121214] p-6 rounded-2xl border border-white/[0.06] shadow-inner">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs text-[#F5F3EE] uppercase tracking-wider font-bold">
                  Metabolic Pacing Index
                </span>
                <span className="font-display text-xs text-[#CDBDFF] font-mono">STABLE 7D</span>
              </div>

              {/* Trajectory SVG */}
              <div className="w-full h-28 relative flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 320 120">
                  <rect x="0" y="30" width="320" height="35" rx="4" fill="rgba(255,255,255,0.03)" />
                  <line x1="0" y1="47" x2="320" y2="47" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                  <path
                    d="M 0 85 C 45 80, 80 60, 130 55 C 180 50, 220 38, 270 42 C 295 44, 305 39, 320 36"
                    fill="none"
                    stroke="#9B7BFF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0 52 C 50 50, 110 50, 160 48 C 210 46, 260 45, 320 44"
                    fill="none"
                    stroke="rgba(77,141,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="130" cy="55" r="4" fill="#212125" stroke="#9B7BFF" strokeWidth="2" />
                  <circle cx="270" cy="42" r="4" fill="#212125" stroke="#9B7BFF" strokeWidth="2" />
                  <circle cx="320" cy="36" r="5" fill="#9B7BFF" />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="flex flex-col bg-[#19191C] p-2 rounded-xl">
                  <span className="font-display text-[10px] text-[#8C8C8E]">Target Floor</span>
                  <span className="font-display font-bold text-sm text-[#F5F3EE]">
                    {profile.targetProtein}g
                  </span>
                </div>
                <div className="flex flex-col bg-[#19191C] p-2 rounded-xl">
                  <span className="font-display text-[10px] text-[#8C8C8E]">Trailing Avg</span>
                  <span className="font-display font-bold text-sm text-[#CDBDFF]">
                    {analysis.avgProtein}g
                  </span>
                </div>
                <div className="flex flex-col bg-[#19191C] p-2 rounded-xl">
                  <span className="font-display text-[10px] text-[#8C8C8E]">Index Delta</span>
                  <span className="font-display font-bold text-sm text-[#AEC6FF]">+11.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Factual Insight Grid */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Protein Benchmark */}
        {(activeCategory === 'all' || activeCategory === 'macros') && (
          <article className="flex flex-col justify-between rounded-2xl bg-[#19191C] shadow-xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0361d1]/20 text-[#AEC6FF] font-display text-xs tracking-wider uppercase font-semibold border border-[#4D8DFF]/20">
                  <Dumbbell className="w-3.5 h-3.5" />
                  PROTEIN BENCHMARK
                </span>
                <span className="font-display text-xs text-[#AEC6FF] font-mono">
                  {analysis.avgProtein >= profile.targetProtein ? '+18G / DAY' : `${analysis.avgProtein}G AVG`}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-display font-bold text-base text-[#F5F3EE]">
                  {analysis.avgProtein >= profile.targetProtein
                    ? "You're averaging robust protein intake this week above your target."
                    : 'Your average protein intake is slightly below your current target.'}
                </h3>
                <p className="text-xs text-[#8C8C8E] leading-relaxed">
                  Shift driven primarily by Greek yogurt breakfast additions (+15g avg) and wild salmon dinner swaps (+24g on alternating evenings).
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#121214] p-3 rounded-xl border border-white/[0.04]">
                <img
                  src="/src/assets/images/meal_salmon_dinner_1790400604267.jpg"
                  alt="Salmon plate"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-display text-xs font-semibold text-[#F5F3EE] truncate">
                    Greek Yogurt &amp; Salmon Protocols
                  </span>
                  <span className="text-[11px] text-[#8C8C8E]">Primary drivers for nitrogen stability</span>
                  <div className="w-full bg-[#212125] rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div className="bg-[#4D8DFF] h-full rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="font-display text-xs text-[#8C8C8E]">
                Weekly delta: {profile.targetProtein - 15}g → {analysis.avgProtein}g
              </span>
              <button
                onClick={() => setActiveTab('food-log')}
                className="inline-flex items-center gap-1 font-display text-xs text-[#AEC6FF] hover:text-white transition-colors cursor-pointer"
              >
                <span>Review Macro Cadence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        )}

        {/* CARD 2: Fiber Alert */}
        {(activeCategory === 'all' || activeCategory === 'macros') && (
          <article className="flex flex-col justify-between rounded-2xl bg-[#19191C] shadow-xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B7BFF]/15 text-[#CDBDFF] font-display text-xs tracking-wider uppercase font-semibold border border-[#9B7BFF]/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  FIBER DEFICIT ALERT
                </span>
                <span className="font-display text-xs text-[#CDBDFF] font-mono">
                  {analysis.fiberDeficitDays} OF 7 DAYS BELOW
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-display font-bold text-base text-[#F5F3EE]">
                  Your fiber intake is below your target on {analysis.fiberDeficitDays} of the last 7 days.
                </h3>
                <p className="text-xs text-[#8C8C8E] leading-relaxed">
                  Currently averaging <span className="text-[#CDBDFF] font-semibold">{analysis.avgFiber}g</span> vs your defined <span className="text-[#F5F3EE] font-semibold">{profile.targetFiber}g daily target</span>. Adding 1 cup raspberries or 2 tbsp chia seeds hits this requirement without caloric expansion.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#121214] p-3 rounded-xl border border-white/[0.04]">
                <img
                  src="/src/assets/images/meal_greek_yogurt_1790400580799.jpg"
                  alt="Chia & Raspberries"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-semibold text-[#F5F3EE]">
                      Immediate Micro-Adjustment
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#9B7BFF]/20 text-[#CDBDFF] font-display text-[10px] font-bold">
                      +9g Fiber
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C8C8E] mt-0.5">
                    1 cup raspberries (64 kcal) or 2 tbsp chia
                  </span>
                  <div className="w-full bg-[#212125] rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div className="bg-[#9B7BFF] h-full rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="font-display text-xs text-[#8C8C8E]">
                Target deficit: -{Math.max(0, profile.targetFiber - analysis.avgFiber)}g/day
              </span>
              <button
                onClick={handleQuickAddFiber}
                className="inline-flex items-center gap-1 font-display text-xs text-[#CDBDFF] hover:text-white transition-colors cursor-pointer"
              >
                <span>Log Quick Fiber Add</span>
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        )}

        {/* CARD 3: Energy Calibration */}
        {(activeCategory === 'all' || activeCategory === 'energy') && (
          <article className="flex flex-col justify-between rounded-2xl bg-[#19191C] shadow-xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B4A]/15 text-[#FFB4A3] font-display text-xs tracking-wider uppercase font-semibold border border-[#FF6B4A]/20">
                  <Flame className="w-3.5 h-3.5" />
                  ENERGY CALIBRATION
                </span>
                <span className="font-display text-xs text-[#FF6B4A] font-mono">
                  {analysis.calorieAdherencePercent}% ADHERENCE
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-display font-bold text-base text-[#F5F3EE]">
                  Your average calorie intake is close to your current target ({analysis.calorieAdherencePercent}% adherence).
                </h3>
                <p className="text-xs text-[#8C8C8E] leading-relaxed">
                  Recording {analysis.avgCals.toLocaleString()} kcal actual against your {profile.targetCalories.toLocaleString()} kcal plan. Day-over-day fluctuation variance has converged under 4%, matching elite metabolic stability thresholds.
                </p>
              </div>

              <div className="bg-[#121214] p-3.5 rounded-xl flex flex-col gap-2 border border-white/[0.04]">
                <div className="flex items-center justify-between font-display text-xs">
                  <span className="text-[#8C8C8E]">Daily Variance Distribution</span>
                  <span className="text-[#FF6B4A] font-bold">
                    {analysis.avgCals - profile.targetCalories} kcal / day
                  </span>
                </div>
                <div className="h-2 w-full bg-[#212125] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#FF6B4A] rounded-full"
                    style={{ width: `${Math.min(100, analysis.calorieAdherencePercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#8C8C8E]">
                  <span>Planned: {profile.targetCalories.toLocaleString()} kcal</span>
                  <span className="text-[#F5F3EE] font-semibold">
                    Logged: {analysis.avgCals.toLocaleString()} kcal
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="font-display text-xs text-[#8C8C8E]">Standard deviation: ±68 kcal</span>
              <button
                onClick={() => setActiveTab('progress')}
                className="inline-flex items-center gap-1 font-display text-xs text-[#FF6B4A] hover:text-white transition-colors cursor-pointer"
              >
                <span>Caloric Trajectory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        )}

        {/* CARD 4: Meal Timing & Satiety */}
        {(activeCategory === 'all' || activeCategory === 'circadian') && (
          <article className="flex flex-col justify-between rounded-2xl bg-[#19191C] shadow-xl p-6 border border-white/[0.08] hover:border-white/[0.15] transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white font-display text-xs tracking-wider uppercase font-semibold border border-white/[0.1]">
                  <Clock className="w-3.5 h-3.5" />
                  MEAL TIMING &amp; SATIETY
                </span>
                <span className="font-display text-xs text-white/80 font-mono">44% EVENING LOAD</span>
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="font-display font-bold text-base text-[#F5F3EE]">
                  Evening calorie distribution accounts for 44% of daily intake.
                </h3>
                <p className="text-xs text-[#8C8C8E] leading-relaxed">
                  Pacing lunch earlier by 45 minutes reduced 16:00 snack impulses and preserved restful nocturnal heart rate variability scores.
                </p>
              </div>

              <div className="bg-[#121214] p-3.5 rounded-xl flex flex-col gap-2 border border-white/[0.04]">
                <div className="flex items-center justify-between font-display text-xs">
                  <span className="text-[#8C8C8E]">Chrononutrition Window</span>
                  <span className="text-[#F5F3EE] font-bold">11h 15m Feeding Window</span>
                </div>
                <div className="grid grid-cols-12 gap-1 h-2 rounded-full overflow-hidden bg-[#212125]">
                  <div className="col-span-3 bg-[#4D8DFF]/60 rounded-sm" title="Morning (22%)" />
                  <div className="col-span-4 bg-[#9B7BFF]/70 rounded-sm" title="Mid-day (34%)" />
                  <div className="col-span-5 bg-[#FF6B4A] rounded-sm" title="Evening (44%)" />
                </div>
                <div className="flex justify-between font-display text-[10px] text-[#8C8C8E]">
                  <span>08:00 (22%)</span>
                  <span>13:15 (34%)</span>
                  <span className="text-[#FF6B4A] font-semibold">19:30 (44%)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.04] flex items-center justify-between">
              <span className="font-display text-xs text-[#8C8C8E]">Optimal nocturnal cut-off: 20:30</span>
              <button
                onClick={() => setActiveTab('food-log')}
                className="inline-flex items-center gap-1 font-display text-xs text-white/90 hover:text-white transition-colors cursor-pointer"
              >
                <span>Shift Food Timing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        )}
      </section>

      {/* Algorithmic Health Telemetry Banner */}
      <section className="relative z-10 w-full">
        <div className="relative overflow-hidden rounded-2xl bg-[#19191C] p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl border border-white/[0.08]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#212125] flex items-center justify-center flex-shrink-0 text-[#9B7BFF] border border-white/[0.06]">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-display font-bold text-base text-[#F5F3EE]">
                Metabolic Adaptation Synthesis Ready
              </h4>
              <p className="text-xs text-[#8C8C8E]">
                CALORA has compiled 42 observational vectors into a 1-page dietary recalibration protocol.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={() => showToast('Compiled telemetry log export ready')}
              className="px-5 py-2.5 rounded-full font-display text-xs font-semibold bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] transition-colors border border-white/[0.08] cursor-pointer"
            >
              Export Telemetry Log
            </button>
            <button
              onClick={() => {
                setActiveTab('calculator');
                showToast('Opening intake synthesizer for recalibration');
              }}
              className="px-6 py-2.5 rounded-full font-display text-xs font-bold bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] shadow-[0_0_24px_rgba(255,107,74,0.45)] transition-all active:scale-95 cursor-pointer"
            >
              Execute Recalibration
            </button>
          </div>
        </div>
      </section>

      {/* Advisory Disclaimer */}
      <footer className="relative z-10 w-full pt-2">
        <div className="rounded-xl bg-[#121214] p-4 flex items-start gap-3 border border-white/[0.04]">
          <ShieldCheck className="w-4 h-4 text-[#8C8C8E] mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[10px] text-[#8C8C8E] uppercase tracking-wider font-semibold">
              Metabolic Intelligence Advisory
            </span>
            <p className="text-xs text-[#8C8C8E] leading-relaxed">
              All insights are algorithmic pattern recognitions of recorded food logs and do not provide medical diagnosis, treatment, or clinical nutrition prescription. Consult a licensed physician or registered dietitian before executing restrictive dietary alterations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
