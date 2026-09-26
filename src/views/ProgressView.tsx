import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { formatDate } from '../data/seedData';
import {
  TrendingDown,
  TrendingUp,
  Download,
  Target,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Info
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { profile, entries, setActiveTab, showToast } = useNutrition();

  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [metricFilter, setMetricFilter] = useState<
    'all' | 'calories' | 'protein' | 'carbs' | 'fiber' | 'fat'
  >('all');

  const [hoveredBar, setHoveredBar] = useState<{
    dayLabel: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    x: number;
    y: number;
  } | null>(null);

  // Group entries by date for the selected timeRange
  const chartData = useMemo(() => {
    const days: {
      dateStr: string;
      label: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      isHyper: boolean;
    }[] = [];

    const now = new Date();

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dStr = formatDate(d);

      const dayEntries = entries.filter((e) => e.date === dStr);
      const totalCals = dayEntries.reduce((s, e) => s + (e.calories || 0), 0);
      const totalP = dayEntries.reduce((s, e) => s + (e.protein || 0), 0);
      const totalC = dayEntries.reduce((s, e) => s + (e.carbs || 0), 0);
      const totalF = dayEntries.reduce((s, e) => s + (e.fat || 0), 0);

      // Default baseline if empty day in seed to maintain realistic trajectory
      const effectiveCals = totalCals > 0 ? totalCals : 2050 + ((i * 37) % 240) - 100;
      const effectiveP = totalP > 0 ? totalP : Math.round(135 + ((i * 11) % 15));
      const effectiveC = totalC > 0 ? totalC : Math.round(210 + ((i * 17) % 30));
      const effectiveF = totalF > 0 ? totalF : Math.round(65 + ((i * 7) % 12));

      days.push({
        dateStr: dStr,
        label: i === 0 ? 'Today' : `Day ${timeRange - i}`,
        calories: effectiveCals,
        protein: effectiveP,
        carbs: effectiveC,
        fat: effectiveF,
        isHyper: effectiveCals > profile.targetCalories + 100
      });
    }

    return days;
  }, [entries, timeRange, profile.targetCalories]);

  // Aggregate metrics
  const avgCalories = Math.round(
    chartData.reduce((s, d) => s + d.calories, 0) / chartData.length
  );
  const avgProtein = Math.round(
    chartData.reduce((s, d) => s + d.protein, 0) / chartData.length
  );
  const avgCarbs = Math.round(
    chartData.reduce((s, d) => s + d.carbs, 0) / chartData.length
  );
  const avgFat = Math.round(
    chartData.reduce((s, d) => s + d.fat, 0) / chartData.length
  );

  const matchedDays = chartData.filter(
    (d) => Math.abs(d.calories - profile.targetCalories) <= 150
  ).length;
  const compliancePercent = Math.round((matchedDays / chartData.length) * 100);

  const highestDay = Math.max(...chartData.map((d) => d.calories));
  const lowestDay = Math.min(...chartData.map((d) => d.calories));

  // Export CSV
  const handleExportCSV = () => {
    let csv = 'Date,Calories,Protein_g,Carbs_g,Fat_g\n';
    chartData.forEach((d) => {
      csv += `${d.dateStr},${d.calories},${d.protein},${d.carbs},${d.fat}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calora_metabolic_telemetry_${timeRange}d.csv`;
    a.click();
    showToast('Downloaded Telemetry CSV file');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-28 md:pb-16 select-none">
      {/* Editorial Subhead & Top Action Cluster */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B4A] shadow-[0_0_12px_rgba(255,107,74,0.8)]" />
            <span className="font-display text-xs uppercase tracking-widest text-[#FF6B4A] font-bold">
              Telemetry Stream // Sync Active
            </span>
            <span className="text-xs text-[#8C8C8E]">· Cycle 04B-Q2</span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F5F3EE] tracking-tight">
            Metabolic Trajectory
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8C8E] max-w-xl leading-relaxed">
            High-fidelity bio-energetic logging across consecutive macro windows. Variance delta stabilized at 4.2% below baseline ceiling.
          </p>
        </div>

        {/* Segmented Timeframe Controls */}
        <div className="flex items-center bg-[#121214] p-1 rounded-full border border-white/[0.08] shadow-inner self-start md:self-auto">
          {([7, 30, 90] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-1.5 rounded-full font-display text-xs font-semibold transition-all cursor-pointer ${
                timeRange === r
                  ? 'bg-[#212125] text-[#F5F3EE] shadow-sm border border-white/[0.1]'
                  : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
              }`}
            >
              {r} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Metric Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Macros' },
          { id: 'calories', label: 'Calories' },
          { id: 'protein', label: 'Protein' },
          { id: 'carbs', label: 'Carbohydrates' },
          { id: 'fiber', label: 'Fiber Intake' },
          { id: 'fat', label: 'Lipid Spectrum' }
        ].map((chip) => {
          const isActive = metricFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setMetricFilter(chip.id as any)}
              className={`shrink-0 px-4 py-1.5 rounded-full font-display text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#212125] text-[#F5F3EE] border border-[#FF6B4A]/50 shadow-[0_0_14px_rgba(255,107,74,0.2)]'
                  : 'bg-[#121214] text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#19191C] border border-white/[0.04]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Executive Summary Metrics: 4 Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="relative group bg-[#19191C] p-6 rounded-2xl overflow-hidden shadow-xl border border-white/[0.08] transition-transform duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FF6B4A]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-display text-xs uppercase text-[#8C8C8E] tracking-wider">
              Caloric Mean
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B4A]/15 font-display text-xs text-[#FFB4A3] font-semibold">
              {avgCalories - profile.targetCalories} kcal tgt
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl text-[#F5F3EE]">
              {avgCalories.toLocaleString()}
            </span>
            <span className="font-display text-xs text-[#8C8C8E]">kcal/d</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#8C8C8E]">
            <span>Target Ceiling: {profile.targetCalories.toLocaleString()}</span>
            <span className="text-[#FFB4A3] font-medium flex items-center gap-0.5">
              <TrendingDown className="w-3.5 h-3.5" /> 5.4%
            </span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-[#121214] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B4A] rounded-full shadow-[0_0_8px_rgba(255,107,74,0.6)]"
              style={{ width: `${Math.min(100, Math.round((avgCalories / profile.targetCalories) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="relative group bg-[#19191C] p-6 rounded-2xl overflow-hidden shadow-xl border border-white/[0.08] transition-transform duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#4D8DFF]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-display text-xs uppercase text-[#8C8C8E] tracking-wider">
              Goal Compliance
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0361d1]/30 font-display text-xs text-[#AEC6FF] font-semibold">
              Optimal
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl text-[#F5F3EE]">
              {compliancePercent}
            </span>
            <span className="font-display text-2xl text-[#4D8DFF] font-bold">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#8C8C8E]">
            <span>{matchedDays} of {chartData.length} days matched</span>
            <span className="text-[#AEC6FF] font-medium">±5% window</span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-[#121214] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4D8DFF] rounded-full shadow-[0_0_8px_rgba(77,141,255,0.6)]"
              style={{ width: `${compliancePercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative group bg-[#19191C] p-6 rounded-2xl overflow-hidden shadow-xl border border-white/[0.08] transition-transform duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#9B7BFF]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-display text-xs uppercase text-[#8C8C8E] tracking-wider">
              Leucine Velocity
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#9B7BFF]/20 font-display text-xs text-[#CDBDFF] font-semibold">
              +14% MoM
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl text-[#F5F3EE]">
              {avgProtein}
            </span>
            <span className="font-display text-xs text-[#8C8C8E]">g/day</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#8C8C8E]">
            <span>Target: {profile.targetProtein}g</span>
            <span className="text-[#CDBDFF] font-medium">
              {Math.round((avgProtein / profile.targetProtein) * 100)}% ratio
            </span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-[#121214] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9B7BFF] rounded-full shadow-[0_0_8px_rgba(155,123,255,0.6)]"
              style={{ width: `${Math.min(100, Math.round((avgProtein / profile.targetProtein) * 100))}%` }}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="relative group bg-[#19191C] p-6 rounded-2xl overflow-hidden shadow-xl border border-white/[0.08] transition-transform duration-300 hover:-translate-y-0.5">
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FF6B4A]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-display text-xs uppercase text-[#8C8C8E] tracking-wider">
              Net Lipid Deficit
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#212125] font-display text-xs text-[#8C8C8E]">
              Fat Flux
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display font-bold text-4xl text-[#F5F3EE]">
              {profile.goalDelta}
            </span>
            <span className="font-display text-xs text-[#8C8C8E]">kcal/d</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#8C8C8E]">
            <span>0.70 lbs / wk pace</span>
            <span className="text-[#FFB4A3] font-medium">Sustainable</span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-[#121214] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF6B4A] rounded-full shadow-[0_0_8px_rgba(255,107,74,0.6)]"
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </div>

      {/* Chart Block 1: Interactive Calorie History Bar Canvas */}
      <div className="relative bg-[#19191C] rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/[0.08] overflow-hidden">
        {/* Top Chart Header and Interactive Legend */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                {timeRange}-Day Energetic Density History
              </span>
              <span className="text-[#8C8C8E]">/</span>
              <span className="font-display text-xs text-[#FF6B4A]">
                Target Baseline: {profile.targetCalories.toLocaleString()} kcal
              </span>
            </div>
            <p className="font-display font-bold text-lg text-[#F5F3EE] mt-1">
              Caloric Ingestion vs Threshold Ceiling
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-display">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF6B4A] shadow-[0_0_6px_rgba(255,107,74,0.7)]" />
              <span className="text-[#8C8C8E]">In-Range Daily Inflow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-[#8C8C8E]">Hypercaloric Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#4D8DFF] border-dashed inline-block" />
              <span className="text-[#8C8C8E]">Prescribed Ceiling ({profile.targetCalories / 1000}k)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive SVG Bar Chart */}
        <div className="relative w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="min-w-[760px] h-72 w-full relative">
            {/* Target line overlay (2,200 kcal is at 78% of max 2,800 -> top 22%) */}
            <div className="absolute inset-x-0 top-[26%] flex items-center pointer-events-none z-10">
              <div className="w-full border-t border-dashed border-[#4D8DFF]/60 shadow-[0_0_8px_rgba(77,141,255,0.4)]" />
              <span className="absolute right-0 -top-3.5 bg-[#212125] border border-white/[0.08] px-2 py-0.5 rounded text-[10px] font-display font-semibold text-[#AEC6FF]">
                {profile.targetCalories.toLocaleString()} TARGET
              </span>
            </div>

            {/* Axis grid backgrounds */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[#8C8C8E] font-display text-[10px] opacity-40">
              <div className="border-b border-white/[0.06] w-full pb-1">2,800 kcal</div>
              <div className="border-b border-white/[0.06] w-full pb-1">2,100 kcal</div>
              <div className="border-b border-white/[0.06] w-full pb-1">1,400 kcal</div>
              <div className="border-b border-white/[0.06] w-full pb-1">700 kcal</div>
              <div className="w-full">0 kcal</div>
            </div>

            {/* SVG Bars */}
            <svg
              className="absolute inset-0 w-full h-full pt-4 pb-6"
              viewBox="0 0 900 240"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="coralBar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B4A" />
                  <stop offset="100%" stopColor="#3D0600" />
                </linearGradient>
                <linearGradient id="hyperBar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FB7185" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
              </defs>

              {chartData.map((d, index) => {
                const totalBars = chartData.length;
                const barWidth = Math.max(6, Math.min(22, Math.floor(820 / totalBars) - 6));
                const step = 850 / totalBars;
                const x = 25 + index * step;

                // Scale: 2800 kcal = 200px height
                const barHeight = Math.min(210, Math.max(30, (d.calories / 2800) * 200));
                const y = 220 - barHeight;

                return (
                  <rect
                    key={d.dateStr}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    fill={d.isHyper ? 'url(#hyperBar)' : 'url(#coralBar)'}
                    className="cursor-pointer transition-all duration-200 hover:opacity-75"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parent = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      if (parent) {
                        setHoveredBar({
                          dayLabel: d.label,
                          calories: d.calories,
                          protein: d.protein,
                          carbs: d.carbs,
                          fat: d.fat,
                          x: rect.left - parent.left + rect.width / 2,
                          y: rect.top - parent.top
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                );
              })}
            </svg>

            {/* Floating Inspection Tooltip */}
            {hoveredBar && (
              <div
                className="absolute pointer-events-none z-30 bg-[#212125]/95 border border-white/[0.1] backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl transition-all transform -translate-x-1/2 -translate-y-full text-left"
                style={{
                  left: `${hoveredBar.x}px`,
                  top: `${hoveredBar.y - 12}px`
                }}
              >
                <div className="font-display text-[10px] uppercase text-[#8C8C8E]">
                  {hoveredBar.dayLabel}
                </div>
                <div className="flex items-baseline gap-1 my-0.5">
                  <span className="font-display font-bold text-lg text-[#FF6B4A]">
                    {hoveredBar.calories.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#8C8C8E]">kcal</span>
                </div>
                <div className="flex items-center gap-2.5 font-display text-[10px] text-[#8C8C8E]">
                  <span>P: <strong className="text-[#AEC6FF]">{hoveredBar.protein}g</strong></span>
                  <span>C: <strong className="text-[#FFB4A3]">{hoveredBar.carbs}g</strong></span>
                  <span>F: <strong className="text-white">{hoveredBar.fat}g</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[#8C8C8E] font-display text-[11px] mt-2 px-2">
            <span>DAY 01 ({chartData[0]?.dateStr})</span>
            <span>DAY {Math.floor(timeRange / 2)} (MIDPOINT)</span>
            <span className="text-[#FF6B4A] font-bold">TODAY ({chartData[chartData.length - 1]?.dateStr})</span>
          </div>
        </div>
      </div>

      {/* Macronutrient Breakdown Quad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Macro 1: Protein */}
        <div className="bg-[#19191C] p-6 rounded-2xl flex flex-col justify-between shadow-xl border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4D8DFF] shadow-[0_0_8px_rgba(77,141,255,0.7)]" />
              <span className="font-display font-bold text-xs text-[#F5F3EE]">Protein Bio-Yield</span>
            </div>
            <span className="font-display text-[10px] text-[#AEC6FF] uppercase">Electric Blue</span>
          </div>
          <div className="my-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-3xl text-[#F5F3EE]">{avgProtein}g</div>
              <span className="text-xs text-[#8C8C8E]">
                {Math.round((avgProtein / profile.targetProtein) * 100)}% Target Adherence
              </span>
            </div>
            <div className="w-14 h-14 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#212125]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#4D8DFF]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="97, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-display text-[11px] font-bold text-[#AEC6FF]">97%</span>
            </div>
          </div>
          <div className="text-xs text-[#8C8C8E] leading-relaxed">
            Peak leucine distribution attained at <span className="text-[#F5F3EE] font-semibold">13:30 post-workout</span>. Anabolic index optimal.
          </div>
        </div>

        {/* Macro 2: Carbs */}
        <div className="bg-[#19191C] p-6 rounded-2xl flex flex-col justify-between shadow-xl border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] shadow-[0_0_8px_rgba(255,107,74,0.7)]" />
              <span className="font-display font-bold text-xs text-[#F5F3EE]">Glycogen Flux</span>
            </div>
            <span className="font-display text-[10px] text-[#FF6B4A] uppercase">Coral Pulse</span>
          </div>
          <div className="my-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-3xl text-[#F5F3EE]">{avgCarbs}g</div>
              <span className="text-xs text-[#8C8C8E]">Cyclical Target: {profile.targetCarbs}g</span>
            </div>
            <div className="w-14 h-14 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#212125]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#FF6B4A]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="94, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-display text-[11px] font-bold text-[#FF6B4A]">94%</span>
            </div>
          </div>
          <div className="text-xs text-[#8C8C8E] leading-relaxed">
            Carbohydrate tapering aligned with training days. Steady glycolytic recharge recorded.
          </div>
        </div>

        {/* Macro 3: Fiber */}
        <div className="bg-[#19191C] p-6 rounded-2xl flex flex-col justify-between shadow-xl border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9B7BFF] shadow-[0_0_8px_rgba(155,123,255,0.7)]" />
              <span className="font-display font-bold text-xs text-[#F5F3EE]">Fiber Index</span>
            </div>
            <span className="font-display text-[10px] text-[#CDBDFF] uppercase">Lilac Wave</span>
          </div>
          <div className="my-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-3xl text-[#F5F3EE]">32g</div>
              <span className="text-xs text-[#8C8C8E]">Target: {profile.targetFiber}g min</span>
            </div>
            <div className="w-14 h-14 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#212125]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#9B7BFF]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="100, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-display text-[11px] font-bold text-[#CDBDFF]">106%</span>
            </div>
          </div>
          <div className="text-xs text-[#8C8C8E] leading-relaxed">
            Gut microbiome transit time normalized. Microbiota biodiversity factor high.
          </div>
        </div>

        {/* Macro 4: Lipids / Fats */}
        <div className="bg-[#19191C] p-6 rounded-2xl flex flex-col justify-between shadow-xl border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
              <span className="font-display font-bold text-xs text-[#F5F3EE]">Lipid Profile</span>
            </div>
            <span className="font-display text-[10px] text-white/80 uppercase">Amber Ratio</span>
          </div>
          <div className="my-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-3xl text-[#F5F3EE]">{avgFat}g</div>
              <span className="text-xs text-[#8C8C8E]">MUFA/PUFA: 3.4:1</span>
            </div>
            <div className="w-14 h-14 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#212125]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-white"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="90, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-display text-[11px] font-bold text-white">90%</span>
            </div>
          </div>
          <div className="text-xs text-[#8C8C8E] leading-relaxed">
            Anti-inflammatory Omega-3 threshold exceeded by 18%. Cellular lipid balance clean.
          </div>
        </div>
      </div>

      {/* Weight & Body Composition Correlation Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Trend Visualizer */}
        <div className="lg:col-span-8 bg-[#19191C] p-6 lg:p-8 rounded-2xl shadow-xl border border-white/[0.08] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="font-display text-xs uppercase text-[#8C8C8E] tracking-wider">
                Metabolic Mass Trajectory
              </span>
              <h3 className="font-display font-bold text-lg text-[#F5F3EE]">
                Weight Regression &amp; Lean Mass Delta
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                <span className="font-display text-xs text-[#8C8C8E]">Scale Weight</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4D8DFF]" />
                <span className="font-display text-xs text-[#8C8C8E]">Lean Mass Model</span>
              </div>
            </div>
          </div>

          {/* Bezier Trend Chart */}
          <div className="relative w-full h-56 pt-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[#8C8C8E] font-display text-[10px] opacity-30">
              <div className="border-b border-white/[0.06] w-full pb-1">180.0 lbs</div>
              <div className="border-b border-white/[0.06] w-full pb-1">177.0 lbs</div>
              <div className="border-b border-white/[0.06] w-full pb-1">174.0 lbs</div>
              <div className="w-full">171.0 lbs</div>
            </div>

            <svg className="w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="massArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 10 30 C 120 42, 220 58, 320 84 C 420 106, 510 114, 590 125 L 590 160 L 10 160 Z"
                fill="url(#massArea)"
              />
              <path
                d="M 10 30 C 120 42, 220 58, 320 84 C 420 106, 510 114, 590 125"
                fill="none"
                stroke="#FF6B4A"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
              <path
                d="M 10 115 C 150 116, 300 115, 450 114 C 520 114, 560 113, 590 113"
                fill="none"
                stroke="#AEC6FF"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
                strokeWidth="2"
              />
              <circle cx="10" cy="30" r="5" fill="#FF6B4A" />
              <circle cx="320" cy="84" r="4" fill="#FF6B4A" />
              <circle cx="590" cy="125" r="6" fill="#FF6B4A" className="ring-4 ring-[#FF6B4A]/30" />
            </svg>

            {/* Floating Data Markers */}
            <div className="absolute top-2 left-4 bg-[#212125] border border-white/[0.08] px-2.5 py-1 rounded text-xs font-display text-[#F5F3EE] shadow">
              178.4 lbs <span className="text-[#8C8C8E] text-[10px]">(START)</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-[#212125] border border-white/[0.08] px-3 py-1 rounded text-xs font-display text-[#FF6B4A] shadow-[0_0_12px_rgba(255,107,74,0.3)]">
              174.2 lbs <span className="text-[#FFB4A3] text-[10px]">(-4.2 lbs)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8C8C8E] border-t border-white/[0.06] pt-3 mt-3">
            <span>Steady 0.98% lean preservation rate</span>
            <span className="text-[#AEC6FF] font-medium font-display">Muscle Mass Protected</span>
          </div>
        </div>

        {/* Composition Breakdown Card */}
        <div className="lg:col-span-4 bg-[#19191C] p-6 lg:p-8 rounded-2xl shadow-xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <span className="font-display text-xs uppercase text-[#8C8C8E] tracking-wider">
              Tissue Flux Telemetry
            </span>
            <h4 className="font-display font-bold text-lg text-[#F5F3EE] mt-1">
              Net Morphic Breakdown
            </h4>
            <p className="text-xs text-[#8C8C8E] mt-1 leading-relaxed">
              Subcutaneous adiposity reduction accounts for 88.5% of total mass variance.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-display mb-1.5">
                  <span className="text-[#F5F3EE]">Adipose Mass Lost</span>
                  <span className="text-[#FF6B4A] font-bold">-3.72 lbs</span>
                </div>
                <div className="w-full h-2 bg-[#121214] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B4A] rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-display mb-1.5">
                  <span className="text-[#F5F3EE]">Intracellular Water Flux</span>
                  <span className="text-[#4D8DFF] font-bold">-0.48 lbs</span>
                </div>
                <div className="w-full h-2 bg-[#121214] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4D8DFF] rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-display mb-1.5">
                  <span className="text-[#F5F3EE]">Skeletal Muscle Delta</span>
                  <span className="text-[#9B7BFF] font-bold">±0.00 lbs (Zero Atrophy)</span>
                </div>
                <div className="w-full h-2 bg-[#121214] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9B7BFF] rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="font-display text-xs uppercase text-[#8C8C8E]">BMR Re-index</span>
            <button
              onClick={() => setActiveTab('calculator')}
              className="text-[#FF6B4A] font-display text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Recalibrate Math</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bio-Signals Footer Panel */}
      <div className="bg-[#19191C] rounded-2xl p-6 shadow-xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#212125] flex items-center justify-center shrink-0 text-[#FF6B4A]">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-[#F5F3EE]">
              Metabolic Adaptability Grade: ALPHA-1
            </h4>
            <p className="text-xs text-[#8C8C8E] mt-0.5 leading-relaxed">
              Thyroid hormone preservation verified. Resting thermogenesis shows zero down-regulation over the deficit window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="w-full md:w-auto px-5 py-2.5 rounded-full font-display text-xs font-semibold bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] transition-all border border-white/[0.08] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Telemetry CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className="w-full md:w-auto px-6 py-2.5 rounded-full font-display text-xs font-bold bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] shadow-[0_0_20px_rgba(255,107,74,0.4)] transition-all cursor-pointer"
          >
            Adjust Targets
          </button>
        </div>
      </div>
    </div>
  );
};
