export interface CalculationInput {
  age: number;
  sex: 'male' | 'female';
  heightFt: number;
  heightIn: number;
  heightCm?: number;
  weightLbs: number;
  weightKg?: number;
  activityMultiplier: number;
  goalDelta: number; // e.g. -500, 0, 300
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinG: number;
  proteinKcal: number;
  carbsG: number;
  carbsKcal: number;
  fatG: number;
  fatKcal: number;
  fiberG: number;
}

export function calculateNutritionTargets(input: CalculationInput): CalculationResult {
  // Height in cm
  const totalInches = (input.heightFt * 12) + (input.heightIn || 0);
  const heightCm = input.heightCm || (totalInches * 2.54);

  // Weight in kg
  const weightKg = input.weightKg || (input.weightLbs * 0.45359237);

  // Mifflin-St Jeor formula
  const sexOffset = input.sex === 'male' ? 5 : -161;
  const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * input.age) + sexOffset);

  // TDEE
  const tdee = Math.round(bmr * (input.activityMultiplier || 1.55));

  // Daily target
  let targetCalories = tdee + (input.goalDelta ?? 0);
  if (targetCalories < 1200) {
    targetCalories = 1200; // Clinical safety floor
  }

  // Macro standard distribution: 25% Protein, 45% Carbs, 30% Fat
  const proteinKcal = Math.round(targetCalories * 0.25);
  const carbsKcal = Math.round(targetCalories * 0.45);
  const fatKcal = Math.round(targetCalories * 0.30);

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG = Math.round(carbsKcal / 4);
  const fatG = Math.round(fatKcal / 9);

  // Fiber target: 14g per 1000 kcal or baseline 30g
  const fiberG = Math.max(30, Math.round((targetCalories / 1000) * 14));

  return {
    bmr,
    tdee,
    targetCalories,
    proteinG,
    proteinKcal,
    carbsG,
    carbsKcal,
    fatG,
    fatKcal,
    fiberG
  };
}
