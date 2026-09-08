import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';
import { AppState, AppAction } from './types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

const defaultProfile = {
  name: '',
  username: '',
  email: '',
  phone: '',
};

const defaultPrivacy = {
  profileVisibility: 'only_me' as const,
  shareNutritionalData: false,
  shareBodyData: false,
  dataResaleOptOut: true,
};

export const initialState: AppState = {
  profile: { ...defaultProfile },
  draft: { ...defaultProfile },
  privacy: { ...defaultPrivacy },
  calorieGoal: 2400,
  macros: { protein: 120, carbs: 240, fat: 70 },
  activity: 'Moderate',
  diet: {
    Vegetarian: false,
    Vegan: false,
    Pescatarian: false,
    Keto: false,
    'Gluten-free': false,
    'Dairy-free': false,
  },
  connected: {
    'Apple Health': false,
    'Google Fit': false,
    Fitbit: false,
    Garmin: false,
  },
  reminders: { enabled: true, Breakfast: true, Lunch: true, Dinner: true, Water: false },
  units: { measure: 'Metric', energy: 'kcal' },
  meal: 'Breakfast',
  selected: {},
  dishName: '',
  servings: 1,
  dishItems: [],
  showPicker: false,
  messages: [
    {
      role: 'bot',
      text: "Hi! I'm your Healthbar coach. Ask me anything about your meals, macros, or what to eat next.",
    },
  ],
  coachInput: '',
  typing: false,
  authMode: 'choose',
  authEmail: '',
  authPassword: '',
  authUsername: '',
  authDob: '',
  authWeight: '',
  authHeight: '',
  authPhone: '',
  showDelete: false,
  subscription: 'free',
  pendingBarcode: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MEAL':
      return { ...state, meal: action.payload };
    case 'TOGGLE_FOOD': {
      const sel = { ...state.selected };
      if (sel[action.payload]) delete sel[action.payload];
      else sel[action.payload] = true;
      return { ...state, selected: sel };
    }
    case 'SET_DISH_NAME':
      return { ...state, dishName: action.payload };
    case 'SET_SERVINGS':
      return { ...state, servings: Math.max(1, Math.min(20, action.payload)) };
    case 'ADD_INGREDIENT': {
      const items = state.dishItems.map((i) => ({ ...i }));
      const ex = items.find((i) => i.id === action.payload);
      if (ex) ex.qty += 1;
      else items.push({ id: action.payload, qty: 1 });
      return { ...state, dishItems: items };
    }
    case 'INC_INGREDIENT': {
      const items = state.dishItems.map((i) =>
        i.id === action.payload ? { ...i, qty: i.qty + 1 } : { ...i }
      );
      return { ...state, dishItems: items };
    }
    case 'DEC_INGREDIENT': {
      const items = state.dishItems
        .map((i) => (i.id === action.payload ? { ...i, qty: i.qty - 1 } : { ...i }))
        .filter((i) => i.qty > 0);
      return { ...state, dishItems: items };
    }
    case 'SET_SHOW_PICKER':
      return { ...state, showPicker: action.payload };
    case 'SET_COACH_INPUT':
      return { ...state, coachInput: action.payload };
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', text: action.payload }],
        coachInput: '',
        typing: true,
      };
    case 'ADD_BOT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'bot', text: action.payload }],
        typing: false,
      };
    case 'SET_TYPING':
      return { ...state, typing: action.payload };
    case 'SET_CALORIE_GOAL':
      return { ...state, calorieGoal: Math.max(1000, Math.min(5000, action.payload)) };
    case 'SET_MACROS':
      return {
        ...state,
        macros: {
          protein: Math.max(0, Math.min(500, action.payload.protein ?? state.macros.protein)),
          carbs: Math.max(0, Math.min(500, action.payload.carbs ?? state.macros.carbs)),
          fat: Math.max(0, Math.min(500, action.payload.fat ?? state.macros.fat)),
        },
      };
    case 'SET_ACTIVITY':
      return { ...state, activity: action.payload };
    case 'TOGGLE_DIET':
      return { ...state, diet: { ...state.diet, [action.payload]: !state.diet[action.payload] } };
    case 'TOGGLE_CONNECTED':
      return {
        ...state,
        connected: { ...state.connected, [action.payload]: !state.connected[action.payload] },
      };
    case 'TOGGLE_REMINDER':
      return {
        ...state,
        reminders: {
          ...state.reminders,
          [action.payload]:
            !(state.reminders as Record<string, boolean>)[action.payload],
        },
      };
    case 'SET_UNIT':
      return {
        ...state,
        units: { ...state.units, [action.payload.field]: action.payload.value } as any,
      };
    case 'SET_DRAFT':
      return { ...state, draft: { ...state.draft, ...action.payload } };
    case 'SAVE_PROFILE':
      return { ...state, profile: { ...state.draft } };
    case 'INIT_DRAFT':
      return { ...state, draft: { ...state.profile } };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.payload };
    case 'SET_AUTH_FIELD':
      return { ...state, [action.payload.field]: action.payload.value } as any;
    case 'RESET_AUTH':
      return {
        ...state,
        authMode: 'choose',
        authEmail: '',
        authPassword: '',
        authUsername: '',
        authDob: '',
        authWeight: '',
        authHeight: '',
        authPhone: '',
      };
    case 'SET_SHOW_DELETE':
      return { ...state, showDelete: action.payload };
    case 'SYNC_PROFILE': {
      const p = action.payload;
      return { ...state, profile: p, draft: p };
    }
    case 'SET_AVATAR_URI':
      return {
        ...state,
        profile: { ...state.profile, avatarUri: action.payload },
        draft: { ...state.draft, avatarUri: action.payload },
      };
    case 'SET_PRIVACY':
      return { ...state, privacy: { ...state.privacy, ...action.payload } };
    case 'SYNC_PRIVACY':
      return { ...state, privacy: action.payload };
    case 'SET_SUBSCRIPTION':
      return { ...state, subscription: action.payload };
    case 'SET_PENDING_BARCODE':
      return { ...state, pendingBarcode: action.payload };
    default:
      return state;
  }
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const meta = user.user_metadata ?? {};
      const firstName = meta.firstName ?? meta.full_name?.split(' ')[0] ?? '';
      const lastName = meta.lastName ?? meta.full_name?.split(' ').slice(1).join(' ') ?? '';
      const fullName = `${firstName} ${lastName}`.trim();
      dispatch({
        type: 'SYNC_PROFILE',
        payload: {
          name: fullName || user.email?.split('@')[0] || '',
          username: meta.username ?? user.email?.split('@')[0] ?? '',
          email: user.email ?? '',
          phone: meta.phone ?? '',
        },
      });

      // Load avatar from user metadata
      if (meta.avatarUrl) {
        dispatch({ type: 'SET_AVATAR_URI', payload: meta.avatarUrl });
      }

      // Load privacy settings from user metadata
      if (meta.privacy) {
        dispatch({ type: 'SYNC_PRIVACY', payload: meta.privacy });
      }

      // Load subscription from user metadata
      dispatch({ type: 'SET_SUBSCRIPTION', payload: meta.subscription ?? 'free' });
    }
  }, [user]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
