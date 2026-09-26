export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  fat: number;
  servingSize: string;
  defaultServingRatio?: number;
  category?: 'dairy' | 'poultry' | 'fish' | 'grains' | 'produce' | 'nuts' | 'supplement' | 'custom';
  isCustom?: boolean;
  image?: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  foodId?: string;
  foodName: string;
  meal: MealType;
  serving: number; // multiplier e.g. 1.0, 1.5
  servingSizeDescription?: string;
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  fat: number;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type ObjectiveGoal = 'fat_loss' | 'maintenance' | 'hypertrophy';

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string;
  age: number;
  sex: 'male' | 'female';
  heightFt: number;
  heightIn: number;
  heightCm: number;
  weightLbs: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  activityMultiplier: number;
  goal: ObjectiveGoal;
  goalDelta: number; // e.g. -500, 0, +300
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFiber: number;
  targetFat: number;
  waterGoalMl: number;
  fastingProtocol: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
  fat: number;
}
