import { FoodEntry, UserProfile } from '../types/nutrition';

// Format YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Elena Vance',
  age: 28,
  sex: 'male',
  heightFt: 5,
  heightIn: 11,
  heightCm: 180,
  weightLbs: 175,
  weightKg: 79.5,
  activityLevel: 'moderate',
  activityMultiplier: 1.55,
  goal: 'fat_loss',
  goalDelta: -500,
  targetCalories: 2200,
  targetProtein: 140,
  targetCarbs: 250,
  targetFiber: 30,
  targetFat: 75,
  waterGoalMl: 3000,
  fastingProtocol: '16:8 Protocol'
};

export function generateSeedEntries(userId: string = 'demo-user'): FoodEntry[] {
  const entries: any[] = [];
  const todayStr = formatDate(new Date());

  // Today's entries (Total = 1,840 kcal)
  entries.push(
    {
      id: 'entry-today-1',
      date: todayStr,
      time: '08:30',
      foodName: 'Greek Yogurt + Wild Berries & Banana',
      meal: 'Breakfast',
      serving: 1.0,
      calories: 420,
      protein: 28,
      carbs: 54,
      fiber: 6,
      fat: 8,
      image: '/src/assets/images/meal_greek_yogurt_1790400580799.jpg'
    },
    {
      id: 'entry-today-2',
      date: todayStr,
      time: '13:10',
      foodName: 'Grilled Chicken Quinoa Rice Bowl',
      meal: 'Lunch',
      serving: 1.0,
      calories: 680,
      protein: 48,
      carbs: 72,
      fiber: 8,
      fat: 18,
      image: '/src/assets/images/meal_chicken_bowl_1790400592765.jpg'
    },
    {
      id: 'entry-today-3',
      date: todayStr,
      time: '16:45',
      foodName: 'Roasted Salted Almonds + Green Apple',
      meal: 'Snack',
      serving: 1.0,
      calories: 180,
      protein: 6,
      carbs: 18,
      fiber: 4,
      fat: 12
    },
    {
      id: 'entry-today-4',
      date: todayStr,
      time: '20:15',
      foodName: 'Wild Alaskan Salmon + Roasted Asparagus & Sweet Potato',
      meal: 'Dinner',
      serving: 1.0,
      calories: 560,
      protein: 42,
      carbs: 44,
      fiber: 7,
      fat: 22,
      image: '/src/assets/images/meal_salmon_dinner_1790400604267.jpg'
    }
  );

  // Generate historical entries for the previous 45 days
  // Realistic variations around 2,050 - 2,250 kcal
  const historicalPresets = [
    {
      breakfast: { name: 'Rolled Oatmeal + Banana & Almond Butter', cals: 380, p: 14, c: 58, fib: 8, f: 12 },
      lunch: { name: 'Grilled Chicken Breast + Brown Rice & Broccoli', cals: 620, p: 52, c: 68, fib: 9, f: 10 },
      snack: { name: 'Whey Protein Shake + Blueberries', cals: 210, p: 32, c: 14, fib: 3, f: 2 },
      dinner: { name: 'Wild Salmon Fillet + Quinoa & Asparagus', cals: 710, p: 48, c: 56, fib: 8, f: 26 }
    },
    {
      breakfast: { name: 'Pasture-Raised Eggs (3) + Whole Wheat Toast', cals: 410, p: 26, c: 28, fib: 4, f: 21 },
      lunch: { name: 'Chicken Rice Power Bowl + Avocado', cals: 740, p: 46, c: 75, fib: 11, f: 24 },
      snack: { name: 'Roasted Almonds + Dark Berries', cals: 220, p: 7, c: 18, fib: 5, f: 14 },
      dinner: { name: 'Lean Sirloin Steak + Sweet Potato Mash', cals: 780, p: 54, c: 52, fib: 6, f: 28 }
    },
    {
      breakfast: { name: 'Greek Yogurt Parfait + Chia Seeds', cals: 360, p: 30, c: 42, fib: 7, f: 6 },
      lunch: { name: 'Turkey Breast Wrap with Spinach & Hummus', cals: 580, p: 44, c: 54, fib: 7, f: 16 },
      snack: { name: 'Apple Slices + Peanut Butter', cals: 190, p: 5, c: 24, fib: 4, f: 10 },
      dinner: { name: 'Baked Salmon + Roasted Vegetables', cals: 680, p: 46, c: 38, fib: 8, f: 28 }
    },
    {
      breakfast: { name: 'Protein Pancakes + Fresh Berries', cals: 440, p: 34, c: 52, fib: 6, f: 8 },
      lunch: { name: 'Grilled Chicken Salad with Olive Oil & Quinoa', cals: 610, p: 48, c: 42, fib: 9, f: 22 },
      snack: { name: 'Hard Boiled Eggs (2) + Sea Salt', cals: 140, p: 12, c: 1, fib: 0, f: 10 },
      dinner: { name: 'Herb Roasted Chicken Breast + Steamed Greens', cals: 650, p: 50, c: 48, fib: 7, f: 18 }
    }
  ];

  for (let i = 1; i <= 45; i++) {
    const dayStr = getOffsetDateString(-i);
    const preset = historicalPresets[i % historicalPresets.length];
    
    // Vary slightly
    const variance = (i % 5 === 0) ? 1.15 : (i % 7 === 0) ? 0.88 : 1.0;

    entries.push(
      {
        id: `entry-hist-${i}-1`,
        date: dayStr,
        time: '08:15',
        foodName: preset.breakfast.name,
        meal: 'Breakfast',
        serving: 1.0,
        calories: Math.round(preset.breakfast.cals * variance),
        protein: Math.round(preset.breakfast.p * variance),
        carbs: Math.round(preset.breakfast.c * variance),
        fiber: Math.round(preset.breakfast.fib),
        fat: Math.round(preset.breakfast.f * variance)
      },
      {
        id: `entry-hist-${i}-2`,
        date: dayStr,
        time: '12:45',
        foodName: preset.lunch.name,
        meal: 'Lunch',
        serving: 1.0,
        calories: Math.round(preset.lunch.cals * variance),
        protein: Math.round(preset.lunch.p * variance),
        carbs: Math.round(preset.lunch.c * variance),
        fiber: Math.round(preset.lunch.fib),
        fat: Math.round(preset.lunch.f * variance)
      },
      {
        id: `entry-hist-${i}-3`,
        date: dayStr,
        time: '16:30',
        foodName: preset.snack.name,
        meal: 'Snack',
        serving: 1.0,
        calories: Math.round(preset.snack.cals * variance),
        protein: Math.round(preset.snack.p * variance),
        carbs: Math.round(preset.snack.c * variance),
        fiber: Math.round(preset.snack.fib),
        fat: Math.round(preset.snack.f * variance)
      },
      {
        id: `entry-hist-${i}-4`,
        date: dayStr,
        time: '20:00',
        foodName: preset.dinner.name,
        meal: 'Dinner',
        serving: 1.0,
        calories: Math.round(preset.dinner.cals * variance),
        protein: Math.round(preset.dinner.p * variance),
        carbs: Math.round(preset.dinner.c * variance),
        fiber: Math.round(preset.dinner.fib),
        fat: Math.round(preset.dinner.f * variance)
      }
    );
  }

  return entries.map((e) => ({ ...e, userId }));
}
