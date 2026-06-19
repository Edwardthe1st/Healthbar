export interface Food {
  id: number;
  name: string;
  serving: string;
  kcal: number;
  protein: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export const FOODS: Food[] = [
  { id: 1, name: 'Grilled chicken breast', serving: '100 g', kcal: 165, protein: 31 },
  { id: 2, name: 'Chicken Caesar salad', serving: '1 bowl', kcal: 320, protein: 28 },
  { id: 3, name: 'Chicken thigh, roasted', serving: '100 g', kcal: 209, protein: 26 },
  { id: 4, name: 'Rotisserie chicken', serving: '3 oz', kcal: 190, protein: 24 },
  { id: 5, name: 'Chicken & rice bowl', serving: '1 bowl', kcal: 540, protein: 34 },
  { id: 6, name: 'Greek yogurt, plain', serving: '170 g', kcal: 100, protein: 17 },
  { id: 7, name: 'Oatmeal, cooked', serving: '1 cup', kcal: 158, protein: 6 },
  { id: 8, name: 'Banana', serving: '1 medium', kcal: 105, protein: 1 },
  { id: 9, name: 'Almonds', serving: '28 g', kcal: 164, protein: 6 },
  { id: 10, name: 'Salmon fillet', serving: '100 g', kcal: 208, protein: 20 },
];

export const INGREDIENT_POOL: Ingredient[] = [
  { id: 'pasta', name: 'Pasta, cooked', unit: '200 g', kcal: 220, p: 8, c: 43, f: 1 },
  { id: 'tomato', name: 'Tomato sauce', unit: '1 cup', kcal: 100, p: 4, c: 18, f: 3 },
  { id: 'beef', name: 'Ground beef', unit: '100 g', kcal: 250, p: 26, c: 0, f: 17 },
  { id: 'oil', name: 'Olive oil', unit: '1 tbsp', kcal: 119, p: 0, c: 0, f: 14 },
  { id: 'parm', name: 'Parmesan', unit: '20 g', kcal: 84, p: 8, c: 1, f: 6 },
  { id: 'onion', name: 'Onion', unit: '1 medium', kcal: 44, p: 1, c: 10, f: 0 },
  { id: 'garlic', name: 'Garlic', unit: '2 cloves', kcal: 9, p: 0, c: 2, f: 0 },
  { id: 'mozz', name: 'Mozzarella', unit: '30 g', kcal: 90, p: 7, c: 1, f: 7 },
  { id: 'chicken', name: 'Chicken breast', unit: '100 g', kcal: 165, p: 31, c: 0, f: 4 },
  { id: 'basil', name: 'Fresh basil', unit: 'handful', kcal: 5, p: 1, c: 1, f: 0 },
];

export const COACH_SUGGESTIONS = [
  'How much protein do I have left?',
  'Suggest a 500-cal lunch',
  'Is oatmeal good post-workout?',
];

export const ACTIVITY_LEVELS: { label: string; desc: string }[] = [
  { label: 'Sedentary', desc: 'Little or no exercise' },
  { label: 'Light', desc: '1\u20133 workouts / week' },
  { label: 'Moderate', desc: '3\u20135 workouts / week' },
  { label: 'Active', desc: '6\u20137 workouts / week' },
  { label: 'Very active', desc: 'Hard training daily' },
];

export const DIET_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Gluten-free',
  'Dairy-free',
];

export const CONNECTED_APPS = ['Apple Health', 'Google Fit', 'Fitbit', 'Garmin'];

export const CALORIE_PRESETS = [1800, 2000, 2200, 2400, 2600];

export const TODAY_MEALS = [
  { name: 'Oatmeal & berries', meal: 'Breakfast', protein: 18, kcal: 320, serving: '1 bowl' },
  { name: 'Grilled chicken salad', meal: 'Lunch', protein: 42, kcal: 480, serving: '1 bowl' },
  { name: 'Greek yogurt', meal: 'Snack', protein: 12, kcal: 180, serving: '170g' },
];

export const DIARY_MEALS = {
  Breakfast: [{ name: 'Oatmeal & berries', serving: '1 bowl', protein: 18, kcal: 320 }],
  Lunch: [{ name: 'Grilled chicken salad', serving: '1 bowl', protein: 42, kcal: 480 }],
  Snack: [
    { name: 'Greek yogurt', serving: '170g', protein: 12, kcal: 180 },
    { name: 'Almonds', serving: '28g', protein: 6, kcal: 180 },
  ],
  Dinner: [],
};

export const INSIGHTS_BARS = [
  { day: 'T', height: 114, kcal: 1900 },
  { day: 'F', height: 129, kcal: 2150 },
  { day: 'S', height: 108, kcal: 1800 },
  { day: 'S', height: 139, kcal: 2320 },
  { day: 'M', height: 121, kcal: 2020 },
  { day: 'T', height: 133, kcal: 2220 },
  { day: 'W', height: 67, kcal: 1160, isToday: true },
];
