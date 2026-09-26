import React, { useState, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { MealType, FoodItem, FoodEntry } from '../types/nutrition';
import { ScanModal } from '../components/ScanModal';
import {
  Sunrise,
  Sun,
  Cookie,
  Moon,
  Plus,
  Search,
  Check,
  Edit2,
  Trash2,
  Camera,
  ShieldCheck,
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';

export const FoodLogView: React.FC = () => {
  const {
    profile,
    selectedDate,
    setSelectedDate,
    previousDay,
    nextDay,
    canGoNext,
    selectedDateTotals,
    selectedDateEntries,
    foods,
    addFoodEntry,
    deleteFoodEntry,
    setEditingEntry,
    setIsAddModalOpen,
    setSelectedMealForAdd
  } = useNutrition();

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [activeMealFilter, setActiveMealFilter] = useState<'All' | MealType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem>(foods[0]);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.5);
  const [selectedCategory, setSelectedCategory] = useState<MealType>('Lunch');

  // Quick chips
  const quickChips = ['Grilled Chicken Breast', 'Brown Rice', 'Fresh Avocado', 'Greek Yogurt (0% or 2%)'];

  // Calculated macro preview for side drawer
  const drawerNutrition = useMemo(() => {
    if (!selectedFood) return { calories: 340, protein: 38, carbs: 12, fiber: 3, fat: 6 };
    return {
      calories: Math.round(selectedFood.calories * portionMultiplier),
      protein: Math.round(selectedFood.protein * portionMultiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * portionMultiplier * 10) / 10,
      fiber: Math.round(selectedFood.fiber * portionMultiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * portionMultiplier * 10) / 10
    };
  }, [selectedFood, portionMultiplier]);

  // Date buttons
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  // Totals & Targets
  const consumed = selectedDateTotals.calories;
  const target = profile.targetCalories;
  const remaining = target - consumed;
  const percent = Math.min(100, Math.round((consumed / target) * 100));

  // Circular ring math
  const ringOffset = 251.2 * (1 - Math.min(1, consumed / target));

  // Filtered log
  const filteredEntries = useMemo(() => {
    if (activeMealFilter === 'All') return selectedDateEntries;
    return selectedDateEntries.filter((e) => e.meal === activeMealFilter);
  }, [selectedDateEntries, activeMealFilter]);

  // Search filtered foods
  const filteredSearchFoods = useMemo(() => {
    if (!searchQuery.trim()) return foods;
    const q = searchQuery.toLowerCase();
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [foods, searchQuery]);

  // Commit drawer addition
  const handleDrawerCommit = () => {
    if (!selectedFood) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addFoodEntry({
      date: selectedDate,
      time: timeStr,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      meal: selectedCategory,
      serving: portionMultiplier,
      servingSizeDescription: selectedFood.servingSize,
      calories: drawerNutrition.calories,
      protein: drawerNutrition.protein,
      carbs: drawerNutrition.carbs,
      fiber: drawerNutrition.fiber,
      fat: drawerNutrition.fat,
      image: selectedFood.image
    });
  };

  const getMealIcon = (meal: MealType) => {
    switch (meal) {
      case 'Breakfast':
        return <Sunrise className="w-5 h-5 text-[#FF6B4A]" />;
      case 'Lunch':
        return <Sun className="w-5 h-5 text-[#4D8DFF]" />;
      case 'Snack':
        return <Cookie className="w-5 h-5 text-[#9B7BFF]" />;
      case 'Dinner':
        return <Moon className="w-5 h-5 text-[#FFB4A3]" />;
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-28 md:pb-16 select-none">
      {/* Top Context & Day Selector Matrix */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse" />
            <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
              Metabolic Timeline // Telemetry Cycle 14
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#F5F3EE] tracking-tight">
            Daily Nutritional Journal
          </h1>
        </div>

        {/* G2 Segmented Calendar Pill Controller */}
        <div className="flex items-center bg-[#121214] p-1 rounded-full border border-white/[0.08] shadow-inner">
          <button
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-4 py-1.5 rounded-full font-display text-xs transition-all cursor-pointer ${
              selectedDate === yesterdayStr
                ? 'bg-[#212125] text-[#F5F3EE] font-semibold shadow-sm border border-white/[0.1]'
                : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
            }`}
          >
            Yesterday, {new Date(yesterdayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </button>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-4 py-1.5 rounded-full font-display text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-[#212125] text-[#F5F3EE] font-semibold shadow-sm border border-white/[0.1]'
                : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
            }`}
          >
            <span>Today, {new Date(todayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A]" />
          </button>
          <button
            onClick={() => {
              if (tomorrowStr <= todayStr) setSelectedDate(tomorrowStr);
            }}
            disabled={tomorrowStr > todayStr}
            className={`px-4 py-1.5 rounded-full font-display text-xs transition-all ${
              tomorrowStr > todayStr
                ? 'text-white/20 cursor-not-allowed'
                : selectedDate === tomorrowStr
                ? 'bg-[#212125] text-[#F5F3EE] font-semibold shadow-sm border border-white/[0.1]'
                : 'text-[#8C8C8E] hover:text-[#F5F3EE] cursor-pointer'
            }`}
          >
            Tomorrow
          </button>
        </div>
      </header>

      {/* Daily Metabolic Velocity Ledger Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#19191C] p-6 lg:p-8 shadow-2xl border border-white/[0.08]">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#FF6B4A]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#4D8DFF]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Caloric Budget Radial & Metrics */}
          <div className="md:col-span-4 flex items-center gap-5">
            <div className="relative flex-shrink-0 w-24 h-24 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-white/10"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-[#FF6B4A] transition-all duration-1000"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display font-bold text-xl text-[#F5F3EE]">{percent}%</span>
                <span className="font-display text-[9px] text-[#8C8C8E] uppercase tracking-wider">TARGET</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                Total Ingestion
              </span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="font-display font-bold text-3xl text-[#F5F3EE]">
                  {consumed.toLocaleString()}
                </span>
                <span className="text-xs text-[#8C8C8E]">/ {target.toLocaleString()} kcal</span>
              </div>
              <span className="text-xs text-[#FFB4A3]">
                {remaining >= 0
                  ? `${remaining.toLocaleString()} kcal remaining until ceiling`
                  : `${Math.abs(remaining).toLocaleString()} kcal over daily target`}
              </span>
            </div>
          </div>

          {/* Macro Split Bar Arrays */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#121214]/80 rounded-xl p-3.5 flex flex-col justify-between border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs text-[#8C8C8E]">Protein</span>
                <span className="font-display text-xs font-semibold text-[#AEC6FF]">
                  {Math.round(selectedDateTotals.protein)}g / {profile.targetProtein}g
                </span>
              </div>
              <div className="w-full bg-[#212125] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#4D8DFF] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (selectedDateTotals.protein / profile.targetProtein) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-[#121214]/80 rounded-xl p-3.5 flex flex-col justify-between border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs text-[#8C8C8E]">Carbs</span>
                <span className="font-display text-xs font-semibold text-[#FFB4A3]">
                  {Math.round(selectedDateTotals.carbs)}g / {profile.targetCarbs}g
                </span>
              </div>
              <div className="w-full bg-[#212125] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF6B4A] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (selectedDateTotals.carbs / profile.targetCarbs) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-[#121214]/80 rounded-xl p-3.5 flex flex-col justify-between border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs text-[#8C8C8E]">Fats</span>
                <span className="font-display text-xs font-semibold text-[#CDBDFF]">
                  {Math.round(selectedDateTotals.fat)}g / {profile.targetFat}g
                </span>
              </div>
              <div className="w-full bg-[#212125] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#9B7BFF] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (selectedDateTotals.fat / profile.targetFat) * 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="bg-[#121214]/80 rounded-xl p-3.5 flex flex-col justify-between border border-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs text-[#8C8C8E]">Dietary Fiber</span>
                <span className="font-display text-xs font-semibold text-white">
                  {Math.round(selectedDateTotals.fiber)}g / {profile.targetFiber}g
                </span>
              </div>
              <div className="w-full bg-[#212125] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white/80 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (selectedDateTotals.fiber / profile.targetFiber) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Splithrough: Food Timeline & Modal Drawer Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Food Log Timeline Stream (Left Column - 7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-[#F5F3EE] tracking-wide">
                Chronological Log
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#212125] text-[#8C8C8E] font-display text-xs border border-white/[0.04]">
                {filteredEntries.length} Meals Registered
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-full border border-white/[0.06]">
              {(['All', 'Breakfast', 'Lunch', 'Snack', 'Dinner'] as const).map((meal) => (
                <button
                  key={meal}
                  onClick={() => setActiveMealFilter(meal)}
                  className={`px-3 py-1 rounded-full font-display text-[11px] transition-colors cursor-pointer ${
                    activeMealFilter === meal
                      ? 'bg-[#212125] text-[#F5F3EE] font-semibold'
                      : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col gap-4">
            {/* Timeline Vertical Guide Line */}
            {filteredEntries.length > 0 && (
              <div className="absolute top-6 bottom-6 left-6 w-0.5 bg-white/10 -z-0" />
            )}

            {filteredEntries.length === 0 ? (
              <div className="p-12 text-center bg-[#19191C] rounded-2xl border border-white/[0.08]">
                <p className="font-display font-semibold text-base text-[#F5F3EE] mb-1">
                  No meals logged yet.
                </p>
                <p className="text-xs text-[#8C8C8E] mb-4">
                  Start your day by adding your first breakfast, lunch, or snack.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-2.5 bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display font-bold text-xs rounded-full cursor-pointer transition-all"
                >
                  + Add Food
                </button>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="relative z-10 flex gap-4 group">
                  {/* Timeline icon node */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#19191C] border border-white/[0.08] flex items-center justify-center shadow-lg">
                    {getMealIcon(entry.meal)}
                  </div>

                  {/* Entry Card */}
                  <div className="flex-1 bg-[#19191C] hover:bg-[#212125] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200 shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xs uppercase tracking-wider text-[#FF6B4A] font-semibold">
                            {entry.meal}
                          </span>
                          <span className="text-[#8C8C8E] text-xs">• {entry.time}</span>
                          {entry.serving !== 1 && (
                            <span className="text-[11px] text-[#8C8C8E] bg-[#121214] px-1.5 py-0.2 rounded">
                              {entry.serving}x portion
                            </span>
                          )}
                        </div>
                        <h2 className="font-display font-bold text-base text-[#F5F3EE] mt-0.5">
                          {entry.foodName}
                        </h2>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-display font-bold text-2xl text-[#F5F3EE]">
                          {entry.calories}
                        </span>
                        <span className="font-display text-[10px] text-[#8C8C8E] uppercase tracking-wider">
                          kcal
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.04]">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121214] text-[#AEC6FF] font-display text-[11px] border border-[#4D8DFF]/20">
                        P: {entry.protein}g
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121214] text-[#FFB4A3] font-display text-[11px] border border-[#FF6B4A]/20">
                        C: {entry.carbs}g
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121214] text-[#CDBDFF] font-display text-[11px] border border-[#9B7BFF]/20">
                        Fiber: {entry.fiber}g
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121214] text-white/90 font-display text-[11px] border border-white/[0.1]">
                        Fat: {entry.fat}g
                      </span>

                      {/* Action buttons */}
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="w-8 h-8 rounded-full bg-[#121214] hover:bg-[#2a2a2a] flex items-center justify-center text-[#8C8C8E] hover:text-[#F5F3EE] transition-colors cursor-pointer"
                          title="Edit Food Entry"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteFoodEntry(entry.id)}
                          className="w-8 h-8 rounded-full bg-[#121214] hover:bg-red-950/60 flex items-center justify-center text-[#8C8C8E] hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Food Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Action Trigger Strip */}
          <div className="p-4 rounded-2xl bg-[#19191C] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-[#FF6B4A]" />
              <span className="text-xs text-[#8C8C8E]">
                Snap a plate photo for instant AI macro estimation
              </span>
            </div>
            <button
              onClick={() => setScanModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#212125] hover:bg-[#2a2a2a] font-display text-xs text-[#F5F3EE] transition-all cursor-pointer border border-white/[0.08]"
            >
              Scan Meal
            </button>
          </div>
        </section>

        {/* Embedded Add Food Drawer (Right Column - 5 cols) */}
        <section className="lg:col-span-5 sticky top-24">
          <div className="relative bg-[#19191C] rounded-2xl p-6 shadow-2xl border border-white/[0.08] flex flex-col gap-5 overflow-hidden">
            {/* Subtle Accent Glow */}
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#FF6B4A]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Drawer Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
                <h2 className="font-display font-bold text-lg text-[#F5F3EE]">Log Food Entry</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedMealForAdd(selectedCategory);
                  setIsAddModalOpen(true);
                }}
                className="text-xs text-[#FF6B4A] hover:underline font-display"
              >
                + Custom Food
              </button>
            </div>

            {/* Meal Category Capsule */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[10px] uppercase tracking-wider text-[#8C8C8E]">
                Meal Category
              </label>
              <div className="grid grid-cols-4 bg-[#121214] p-1 rounded-full border border-white/[0.06] text-center">
                {(['Breakfast', 'Lunch', 'Snack', 'Dinner'] as MealType[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1 rounded-full font-display text-xs transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#212125] text-[#F5F3EE] font-semibold shadow-sm border border-white/[0.1]'
                        : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Bar with Barcode Scanner Icon */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-display text-[10px] uppercase tracking-wider text-[#8C8C8E]">
                  Select or Search Food
                </label>
                <button
                  onClick={() => setScanModalOpen(true)}
                  className="font-display text-[10px] text-[#4D8DFF] flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <Camera className="w-3 h-3" />
                  <span>Scan Plate / Barcode</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#8C8C8E] absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF6B4A]/60"
                />
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickChips.map((chipName) => {
                  const item = foods.find((f) => f.name.toLowerCase().includes(chipName.toLowerCase()));
                  const isSelected = selectedFood?.id === item?.id;
                  return (
                    <button
                      key={chipName}
                      onClick={() => {
                        if (item) setSelectedFood(item);
                      }}
                      className={`px-3 py-1 rounded-full font-display text-[11px] transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#212125] text-[#FF6B4A] border border-[#FF6B4A]/40'
                          : 'bg-[#121214] text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#212125] border border-white/[0.04]'
                      }`}
                    >
                      {chipName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Serving Size Specification */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-display text-[10px] uppercase tracking-wider text-[#8C8C8E]">
                  Serving Weight / Ratio
                </label>
                <span className="text-[10px] text-[#8C8C8E]">
                  Base: {selectedFood?.servingSize || '150g'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121214] rounded-xl p-3 flex items-center justify-between border border-white/[0.06]">
                  <span className="text-xs text-[#8C8C8E]">Portions</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={portionMultiplier}
                      onChange={(e) => setPortionMultiplier(parseFloat(e.target.value) || 1)}
                      className="w-14 bg-transparent font-display font-bold text-sm text-[#F5F3EE] text-right focus:outline-none"
                    />
                    <span className="text-xs text-[#8C8C8E]">x</span>
                  </div>
                </div>
                <div className="bg-[#121214] rounded-xl p-3 flex items-center justify-between border border-white/[0.06]">
                  <span className="text-xs text-[#8C8C8E]">Net Energy</span>
                  <span className="font-display font-bold text-sm text-[#FF6B4A]">
                    {drawerNutrition.calories} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Macro Input / Recalculation Grid */}
            <div className="flex flex-col gap-1.5">
              <label className="font-display text-[10px] uppercase tracking-wider text-[#8C8C8E]">
                Nutritional Composition
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="bg-[#121214] p-2 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="font-display text-[9px] uppercase text-[#8C8C8E]">Calories</span>
                  <span className="font-display font-bold text-sm text-[#F5F3EE] mt-0.5">
                    {drawerNutrition.calories}
                  </span>
                  <span className="text-[9px] text-[#8C8C8E]">kcal</span>
                </div>
                <div className="bg-[#121214] p-2 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="font-display text-[9px] uppercase text-[#4D8DFF]">Protein</span>
                  <span className="font-display font-bold text-sm text-[#AEC6FF] mt-0.5">
                    {drawerNutrition.protein}g
                  </span>
                  <span className="text-[9px] text-[#8C8C8E]">45%</span>
                </div>
                <div className="bg-[#121214] p-2 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="font-display text-[9px] uppercase text-[#FF6B4A]">Carbs</span>
                  <span className="font-display font-bold text-sm text-[#FFB4A3] mt-0.5">
                    {drawerNutrition.carbs}g
                  </span>
                  <span className="text-[9px] text-[#8C8C8E]">14%</span>
                </div>
                <div className="bg-[#121214] p-2 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="font-display text-[9px] uppercase text-[#9B7BFF]">Fiber</span>
                  <span className="font-display font-bold text-sm text-[#CDBDFF] mt-0.5">
                    {drawerNutrition.fiber}g
                  </span>
                  <span className="text-[9px] text-[#8C8C8E]">Soluble</span>
                </div>
                <div className="bg-[#121214] p-2 rounded-xl border border-white/[0.04] flex flex-col">
                  <span className="font-display text-[9px] uppercase text-white">Fat</span>
                  <span className="font-display font-bold text-sm text-white mt-0.5">
                    {drawerNutrition.fat}g
                  </span>
                  <span className="text-[9px] text-[#8C8C8E]">16%</span>
                </div>
              </div>
            </div>

            {/* Micro Ingredient Preview Vignette */}
            <div className="relative h-24 rounded-xl overflow-hidden shadow-inner flex items-end p-3 border border-white/[0.08]">
              <img
                src={selectedFood.image || '/src/assets/images/meal_chicken_bowl_1790400592765.jpg'}
                alt={selectedFood.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="font-display text-xs text-[#F5F3EE] flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B4A]" />
                  Verified USDA Laboratory Profile
                </span>
                <span className="text-[10px] font-display text-[#FFB4A3] bg-[#0B0B0C]/80 px-2 py-0.5 rounded border border-white/[0.08]">
                  High Bio-Availability
                </span>
              </div>
            </div>

            {/* Primary Commit CTA Button */}
            <button
              onClick={handleDrawerCommit}
              className="w-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] py-3.5 px-6 rounded-full font-display text-sm font-bold shadow-[0_0_32px_rgba(255,107,74,0.35)] hover:shadow-[0_0_48px_rgba(255,107,74,0.55)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Add to Today's Log</span>
            </button>
          </div>
        </section>
      </div>

      <ScanModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
      />
    </div>
  );
};
