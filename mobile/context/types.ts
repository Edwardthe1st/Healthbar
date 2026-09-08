export interface Profile {
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUri?: string;
}

export interface PrivacySettings {
  profileVisibility: 'everyone' | 'friends' | 'only_me';
  shareNutritionalData: boolean;
  shareBodyData: boolean;
  dataResaleOptOut: boolean;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface Reminders {
  enabled: boolean;
  Breakfast: boolean;
  Lunch: boolean;
  Dinner: boolean;
  Water: boolean;
}

export interface Units {
  measure: 'Metric' | 'Imperial';
  energy: 'kcal' | 'kJ';
}

export interface DishItem {
  id: string;
  qty: number;
}

export interface CoachMessage {
  role: 'bot' | 'user';
  text: string;
}

export type SubscriptionTier = 'free' | 'no_ads' | 'plus';

export interface AppState {
  profile: Profile;
  draft: Profile;
  privacy: PrivacySettings;

  calorieGoal: number;
  macros: Macros;
  activity: string;
  diet: Record<string, boolean>;
  connected: Record<string, boolean>;
  reminders: Reminders;
  units: Units;

  meal: string;
  selected: Record<string, boolean>;

  dishName: string;
  servings: number;
  dishItems: DishItem[];
  showPicker: boolean;

  messages: CoachMessage[];
  coachInput: string;
  typing: boolean;

  authMode: 'choose' | 'email' | 'signup';
  authEmail: string;
  authPassword: string;
  authUsername: string;
  authDob: string;
  authWeight: string;
  authHeight: string;
  authPhone: string;

  showDelete: boolean;
  subscription: SubscriptionTier;
  pendingBarcode: string | null;
}

export type AppAction =
  | { type: 'SET_MEAL'; payload: string }
  | { type: 'TOGGLE_FOOD'; payload: string }
  | { type: 'SET_DISH_NAME'; payload: string }
  | { type: 'SET_SERVINGS'; payload: number }
  | { type: 'ADD_INGREDIENT'; payload: string }
  | { type: 'INC_INGREDIENT'; payload: string }
  | { type: 'DEC_INGREDIENT'; payload: string }
  | { type: 'SET_SHOW_PICKER'; payload: boolean }
  | { type: 'SET_COACH_INPUT'; payload: string }
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'ADD_BOT_MESSAGE'; payload: string }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CALORIE_GOAL'; payload: number }
  | { type: 'SET_MACROS'; payload: Partial<Macros> }
  | { type: 'SET_ACTIVITY'; payload: string }
  | { type: 'TOGGLE_DIET'; payload: string }
  | { type: 'TOGGLE_CONNECTED'; payload: string }
  | { type: 'TOGGLE_REMINDER'; payload: string }
  | { type: 'SET_UNIT'; payload: { field: 'measure' | 'energy'; value: string } }
  | { type: 'SET_DRAFT'; payload: Partial<Profile> }
  | { type: 'SAVE_PROFILE' }
  | { type: 'INIT_DRAFT' }
  | { type: 'SET_AUTH_MODE'; payload: 'choose' | 'email' | 'signup' }
  | { type: 'SET_AUTH_FIELD'; payload: { field: string; value: string } }
  | { type: 'RESET_AUTH' }
  | { type: 'SET_SHOW_DELETE'; payload: boolean }
  | { type: 'SYNC_PROFILE'; payload: Profile }
  | { type: 'SET_AVATAR_URI'; payload: string }
  | { type: 'SET_PRIVACY'; payload: Partial<PrivacySettings> }
  | { type: 'SYNC_PRIVACY'; payload: PrivacySettings }
  | { type: 'SET_SUBSCRIPTION'; payload: SubscriptionTier }
  | { type: 'SET_PENDING_BARCODE'; payload: string | null };
