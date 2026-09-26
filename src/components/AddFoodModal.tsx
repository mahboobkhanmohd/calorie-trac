import React, { useState, useEffect, useMemo } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { MealType, FoodItem } from '../types/nutrition';
import { X, Search, Check, Plus, Sparkles, Scale, AlertCircle } from 'lucide-react';

export const AddFoodModal: React.FC = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    selectedMealForAdd,
    editingEntry,
    setEditingEntry,
    foods,
    addFoodEntry,
    updateFoodEntry,
    addCustomFood,
    selectedDate
  } = useNutrition();

  const [mealCategory, setMealCategory] = useState<MealType>(selectedMealForAdd);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFiber, setCustomFiber] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customServing, setCustomServing] = useState('1 serving (100g)');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync when opening or editing
  useEffect(() => {
    if (editingEntry) {
      setMealCategory(editingEntry.meal);
      const matched = foods.find((f) => f.name.toLowerCase() === editingEntry.foodName.toLowerCase());
      if (matched) {
        setSelectedFood(matched);
      } else {
        setSelectedFood({
          id: 'temp-edit',
          name: editingEntry.foodName,
          calories: editingEntry.calories / (editingEntry.serving || 1),
          protein: editingEntry.protein / (editingEntry.serving || 1),
          carbs: editingEntry.carbs / (editingEntry.serving || 1),
          fiber: editingEntry.fiber / (editingEntry.serving || 1),
          fat: editingEntry.fat / (editingEntry.serving || 1),
          servingSize: editingEntry.servingSizeDescription || '1 serving'
        });
      }
      setPortionMultiplier(editingEntry.serving || 1.0);
      setActiveTab('search');
    } else {
      setMealCategory(selectedMealForAdd);
      if (!selectedFood && foods.length > 0) {
        setSelectedFood(foods[0]);
      }
    }
  }, [editingEntry, selectedMealForAdd, foods]);

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return foods;
    const q = searchQuery.toLowerCase();
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
    );
  }, [foods, searchQuery]);

  if (!isAddModalOpen && !editingEntry) return null;

  const handleClose = () => {
    setIsAddModalOpen(false);
    setEditingEntry(null);
    setFormError(null);
  };

  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 };
    return {
      calories: Math.round(selectedFood.calories * portionMultiplier),
      protein: Math.round(selectedFood.protein * portionMultiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * portionMultiplier * 10) / 10,
      fiber: Math.round(selectedFood.fiber * portionMultiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * portionMultiplier * 10) / 10
    };
  }, [selectedFood, portionMultiplier]);

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setFormError('Food name is required');
      return;
    }
    const cals = parseFloat(customCalories);
    if (isNaN(cals) || cals < 0) {
      setFormError('Please enter valid calories');
      return;
    }

    const p = parseFloat(customProtein) || 0;
    const c = parseFloat(customCarbs) || 0;
    const fib = parseFloat(customFiber) || 0;
    const f = parseFloat(customFat) || 0;

    const newFood = await addCustomFood({
      name: customName.trim(),
      calories: Math.round(cals),
      protein: p,
      carbs: c,
      fiber: fib,
      fat: f,
      servingSize: customServing.trim() || '1 serving',
      category: 'custom'
    });

    setSelectedFood(newFood);
    setPortionMultiplier(1.0);
    setActiveTab('search');
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFiber('');
    setCustomFat('');
    setFormError(null);
  };

  const handleCommitEntry = () => {
    if (!selectedFood) {
      setFormError('Please select or create a food item');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (editingEntry) {
      updateFoodEntry(editingEntry.id, {
        foodName: selectedFood.name,
        meal: mealCategory,
        serving: portionMultiplier,
        servingSizeDescription: selectedFood.servingSize,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fiber: calculatedNutrition.fiber,
        fat: calculatedNutrition.fat
      });
    } else {
      addFoodEntry({
        date: selectedDate,
        time: timeStr,
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        meal: mealCategory,
        serving: portionMultiplier,
        servingSizeDescription: selectedFood.servingSize,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fiber: calculatedNutrition.fiber,
        fat: calculatedNutrition.fat,
        image: selectedFood.image
      });
    }

    handleClose();
  };

  const mealOptions: MealType[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  const quickRatios = [0.5, 1.0, 1.5, 2.0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#19191C] border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden my-8">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#FF6B4A]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FF6B4A]/20 flex items-center justify-center text-[#FF6B4A]">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-[#F5F3EE]">
                {editingEntry ? 'Edit Food Entry' : 'Log Food Entry'}
              </h2>
              <p className="text-xs text-[#8C8C8E]">
                {editingEntry ? 'Modify recorded intake' : `Adding to ${selectedDate}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#121214] flex items-center justify-center text-[#8C8C8E] hover:text-[#F5F3EE] hover:bg-[#212125] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Search Food vs Create Custom Food */}
        <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-full border border-white/[0.06] my-4">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 rounded-full font-display text-xs font-semibold transition-all ${
              activeTab === 'search'
                ? 'bg-[#212125] text-[#F5F3EE] shadow-sm'
                : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
            }`}
          >
            Search Food Database
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-full font-display text-xs font-semibold transition-all ${
              activeTab === 'custom'
                ? 'bg-[#212125] text-[#F5F3EE] shadow-sm'
                : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
            }`}
          >
            + Create Custom Food
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Meal Category Capsule */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
            Meal Category
          </label>
          <div className="grid grid-cols-4 bg-[#121214] p-1 rounded-full border border-white/[0.06] text-center">
            {mealOptions.map((meal) => (
              <button
                key={meal}
                type="button"
                onClick={() => setMealCategory(meal)}
                className={`py-1.5 rounded-full font-display text-xs transition-all ${
                  mealCategory === meal
                    ? 'bg-[#212125] text-[#F5F3EE] font-semibold shadow-sm border border-white/[0.1]'
                    : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                }`}
              >
                {meal}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'search' ? (
          <>
            {/* Search Input */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                Select or Search Food
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#8C8C8E] absolute left-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Chicken breast, Greek yogurt, Salmon, Oatmeal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF6B4A]/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-xs text-[#8C8C8E] hover:text-[#F5F3EE]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Food Quick Pick List */}
              <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1 no-scrollbar mt-2 border border-white/[0.04] rounded-xl p-1 bg-[#121214]/60">
                {filteredFoods.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8C8C8E]">
                    No foods found matching "{searchQuery}". You can create it as a custom food!
                  </div>
                ) : (
                  filteredFoods.map((item) => {
                    const isSelected = selectedFood?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedFood(item);
                          setFormError(null);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#212125] border border-[#FF6B4A]/40 text-[#F5F3EE]'
                            : 'hover:bg-[#19191C] text-[#e5e2e1]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#FF6B4A] flex items-center justify-center text-[#101010] shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                          )}
                          <div className="truncate">
                            <div className="font-display font-medium text-xs text-[#F5F3EE] truncate">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[#8C8C8E]">
                              {item.servingSize} · P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                            </div>
                          </div>
                        </div>
                        <div className="font-display font-bold text-xs text-[#FF6B4A] shrink-0 ml-2">
                          {item.calories} kcal
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Serving Size & Portion Multiplier */}
            <div className="flex flex-col gap-1.5 mb-5">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                  Serving Ratio / Portion
                </label>
                <span className="text-[11px] text-[#8C8C8E]">
                  Base: {selectedFood?.servingSize || '1 serving'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-4 gap-1.5 flex-1 bg-[#121214] p-1 rounded-xl border border-white/[0.06]">
                  {quickRatios.map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setPortionMultiplier(ratio)}
                      className={`py-1.5 rounded-lg font-display text-xs font-semibold transition-all ${
                        portionMultiplier === ratio
                          ? 'bg-[#212125] text-[#FF6B4A] shadow-sm'
                          : 'text-[#8C8C8E] hover:text-[#F5F3EE]'
                      }`}
                    >
                      {ratio}x
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-[#121214] px-3 py-1.5 rounded-xl border border-white/[0.08] w-28">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={portionMultiplier}
                    onChange={(e) => setPortionMultiplier(parseFloat(e.target.value) || 1)}
                    className="w-full bg-transparent font-display text-sm text-[#F5F3EE] focus:outline-none text-right font-bold"
                  />
                  <span className="text-xs text-[#8C8C8E]">ratio</span>
                </div>
              </div>
            </div>

            {/* Live Nutrition Composition Preview */}
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
                Nutritional Composition
              </label>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="bg-[#121214] p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
                  <span className="font-display text-[10px] uppercase text-[#8C8C8E]">Calories</span>
                  <span className="font-display text-base font-bold text-[#FF6B4A] mt-1">
                    {calculatedNutrition.calories}
                  </span>
                  <span className="text-[10px] text-[#8C8C8E]">kcal</span>
                </div>
                <div className="bg-[#121214] p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
                  <span className="font-display text-[10px] uppercase text-[#4D8DFF]">Protein</span>
                  <span className="font-display text-base font-bold text-[#AEC6FF] mt-1">
                    {calculatedNutrition.protein}g
                  </span>
                  <span className="text-[10px] text-[#8C8C8E]">muscle</span>
                </div>
                <div className="bg-[#121214] p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
                  <span className="font-display text-[10px] uppercase text-[#FF6B4A]">Carbs</span>
                  <span className="font-display text-base font-bold text-[#FFB4A3] mt-1">
                    {calculatedNutrition.carbs}g
                  </span>
                  <span className="text-[10px] text-[#8C8C8E]">energy</span>
                </div>
                <div className="bg-[#121214] p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
                  <span className="font-display text-[10px] uppercase text-[#9B7BFF]">Fiber</span>
                  <span className="font-display text-base font-bold text-[#CDBDFF] mt-1">
                    {calculatedNutrition.fiber}g
                  </span>
                  <span className="text-[10px] text-[#8C8C8E]">gut</span>
                </div>
                <div className="bg-[#121214] p-2.5 rounded-xl border border-white/[0.06] flex flex-col">
                  <span className="font-display text-[10px] uppercase text-[#F5F3EE]">Lipids</span>
                  <span className="font-display text-base font-bold text-[#e5e2e1] mt-1">
                    {calculatedNutrition.fat}g
                  </span>
                  <span className="text-[10px] text-[#8C8C8E]">cellular</span>
                </div>
              </div>
            </div>

            {/* Commit Button */}
            <button
              type="button"
              onClick={handleCommitEntry}
              className="w-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] py-3.5 px-6 rounded-full font-display text-base font-bold shadow-[0_0_32px_rgba(255,107,74,0.35)] hover:shadow-[0_0_48px_rgba(255,107,74,0.55)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>{editingEntry ? 'Update Entry' : "Add to Today's Log"}</span>
            </button>
          </>
        ) : (
          /* Custom Food Form */
          <form onSubmit={handleCreateCustomFood} className="flex flex-col gap-4">
            <div>
              <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E] block mb-1">
                Food Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Homemade Sourdough Sandwich"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#FF6B4A]/60"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E] block mb-1">
                  Serving Size Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 bowl (250g)"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#FF6B4A]/60"
                />
              </div>
              <div>
                <label className="font-display text-xs uppercase tracking-wider text-[#FF6B4A] block mb-1">
                  Calories (kcal) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 320"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#FF6B4A]/60"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="font-display text-[11px] uppercase tracking-wider text-[#4D8DFF] block mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-2.5 py-2 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="font-display text-[11px] uppercase tracking-wider text-[#FF6B4A] block mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-2.5 py-2 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="font-display text-[11px] uppercase tracking-wider text-[#9B7BFF] block mb-1">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-2.5 py-2 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="font-display text-[11px] uppercase tracking-wider text-[#F5F3EE] block mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-2.5 py-2 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-3 w-full bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] border border-white/[0.1] py-3 px-6 rounded-full font-display text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#FF6B4A]" />
              <span>Save &amp; Select for Entry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
