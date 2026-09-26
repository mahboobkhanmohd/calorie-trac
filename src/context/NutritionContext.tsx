import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { FoodEntry, FoodItem, UserProfile, DailyTotals, MealType } from '../types/nutrition';
import { INITIAL_FOOD_DATABASE } from '../data/foods';
import { DEFAULT_PROFILE, generateSeedEntries, formatDate } from '../data/seedData';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { offlineQueue, QueueItem } from '../lib/offlineQueue';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

interface NutritionContextType {
  profile: UserProfile;
  foods: FoodItem[];
  entries: FoodEntry[];
  selectedDate: string; // YYYY-MM-DD
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  selectedMealForAdd: MealType;
  setSelectedMealForAdd: (meal: MealType) => void;
  editingEntry: FoodEntry | null;
  setEditingEntry: (entry: FoodEntry | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Date navigation
  setSelectedDate: (date: string) => void;
  previousDay: () => void;
  nextDay: () => void;
  goToToday: () => void;
  isToday: boolean;
  canGoNext: boolean;

  // Food operations
  todayEntries: FoodEntry[];
  selectedDateEntries: FoodEntry[];
  todayTotals: DailyTotals;
  selectedDateTotals: DailyTotals;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'userId'> & { userId?: string }) => Promise<void>;
  updateFoodEntry: (id: string, entry: Partial<FoodEntry>) => Promise<void>;
  deleteFoodEntry: (id: string) => Promise<void>;
  addCustomFood: (food: Omit<FoodItem, 'id'>) => Promise<FoodItem>;

  // Profile operations
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Water tracking
  waterIntakeToday: number;
  addWater: (ml: number) => void;
  setWater: (ml: number) => void;

  // Offline queuing & synchronization
  isOnline: boolean;
  offlineSyncStatus: 'idle' | 'syncing' | 'offline';
  pendingSyncCount: number;
  triggerSync: () => Promise<void>;

  // Live voice modal
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;

  // Reset / persistence
  resetToDemoData: () => void;
  exportDataJSON: () => string;
  deleteUserData: (deleteProfileDoc?: boolean) => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'calora_profile_v1',
  FOODS: 'calora_foods_v1',
  ENTRIES: 'calora_entries_v1',
  WATER: 'calora_water_v1'
};

export const NutritionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const todayStr = useMemo(() => formatDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+/, '').split('/')[0] || '';
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0] || '';
      const route = hash || path;
      if (route) return route;
    }
    return 'landing';
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedMealForAdd, setSelectedMealForAdd] = useState<MealType>('Lunch');
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  // Offline queue state
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineSyncStatus, setOfflineSyncStatus] = useState<'idle' | 'syncing' | 'offline'>('idle');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(offlineQueue.getPendingCount());

  // Listen to network status and offline queue
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Online: syncing pending food logs...');
      offlineQueue.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline mode: changes will queue locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeQueue = offlineQueue.subscribe((queue, status) => {
      setPendingSyncCount(queue.length);
      setOfflineSyncStatus(status);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeQueue();
    };
  }, []);

  // Initialize Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    return DEFAULT_PROFILE;
  });

  // Initialize Foods
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOODS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load foods', e);
    }
    return INITIAL_FOOD_DATABASE;
  });

  // Initialize Entries
  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load entries', e);
    }
    return generateSeedEntries();
  });

  // Initialize Water
  const [waterData, setWaterData] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load water data', e);
    }
    return { [todayStr]: 2400 };
  });

  // Local storage backups
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile to localStorage', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOODS, JSON.stringify(foods));
    } catch (e) {
      console.error('Error saving foods to localStorage', e);
    }
  }, [foods]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving entries to localStorage', e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(waterData));
    } catch (e) {
      console.error('Error saving water to localStorage', e);
    }
  }, [waterData]);

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);

    // 1. Sync User Profile
    getDoc(userDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          setProfile((prev) => ({
            ...prev,
            ...remoteData,
            name: remoteData.name || user.displayName || prev.name,
          }));
        } else {
          // Initialize remote profile
          const initialProfileData = {
            ...profile,
            uid: user.uid,
            name: user.displayName || profile.name || 'Athletic Member',
            email: user.email || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setDoc(userDocRef, initialProfileData).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
          });
        }
      })
      .catch((err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      });

    // 2. Listen to User's Food Entries
    const entriesColRef = collection(db, 'users', user.uid, 'foodEntries');
    const unsubEntries = onSnapshot(
      entriesColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteEntries: FoodEntry[] = [];
          snapshot.forEach((d) => {
            remoteEntries.push(d.data() as FoodEntry);
          });
          // Sort reverse chronologically
          remoteEntries.sort((a, b) => b.time.localeCompare(a.time));
          setEntries(remoteEntries);
        } else {
          // Seed the remote collection with current entries if empty
          entries.forEach((e) => {
            const entryDoc = doc(db, 'users', user.uid, 'foodEntries', e.id);
            setDoc(entryDoc, { ...e, userId: user.uid }).catch(() => {});
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/foodEntries`);
      }
    );

    // 3. Listen to User's Custom Foods
    const customFoodsColRef = collection(db, 'users', user.uid, 'customFoods');
    const unsubCustomFoods = onSnapshot(
      customFoodsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const userCustoms: FoodItem[] = [];
          snapshot.forEach((d) => {
            userCustoms.push(d.data() as FoodItem);
          });
          setFoods((prev) => {
            const baseFoods = prev.filter((f) => !f.isCustom);
            return [...userCustoms, ...baseFoods];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/customFoods`);
      }
    );

    return () => {
      unsubEntries();
      unsubCustomFoods();
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Date helpers
  const isToday = selectedDate === todayStr;
  const canGoNext = selectedDate < todayStr;

  const previousDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    setSelectedDate(formatDate(dateObj));
  };

  const nextDay = () => {
    if (!canGoNext) return;
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const nextStr = formatDate(dateObj);
    if (nextStr <= todayStr) {
      setSelectedDate(nextStr);
    }
  };

  const goToToday = () => {
    setSelectedDate(todayStr);
  };

  // Filter entries
  const todayEntries = useMemo(() => {
    return entries.filter((e) => e.date === todayStr);
  }, [entries, todayStr]);

  const selectedDateEntries = useMemo(() => {
    return entries.filter((e) => e.date === selectedDate);
  }, [entries, selectedDate]);

  // Aggregate totals
  const calculateTotals = (items: FoodEntry[]): DailyTotals => {
    return items.reduce<DailyTotals>(
      (acc, item) => ({
        calories: Math.round(acc.calories + (item.calories || 0)),
        protein: Math.round(acc.protein + (item.protein || 0)),
        carbs: Math.round(acc.carbs + (item.carbs || 0)),
        fiber: Math.round(acc.fiber + (item.fiber || 0)),
        fat: Math.round(acc.fat + (item.fat || 0))
      }),
      { calories: 0, protein: 0, carbs: 0, fiber: 0, fat: 0 }
    );
  };

  const todayTotals = useMemo(() => calculateTotals(todayEntries), [todayEntries]);
  const selectedDateTotals = useMemo(() => calculateTotals(selectedDateEntries), [selectedDateEntries]);

  // Food actions
  const addFoodEntry = async (entryData: Omit<FoodEntry, 'id' | 'userId'>) => {
    const assignedUserId = user ? user.uid : 'demo-user';
    const newId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: FoodEntry = {
      ...entryData,
      id: newId,
      userId: assignedUserId,
    };

    setEntries((prev) => [newEntry, ...prev]);

    if (user) {
      const path = `users/${user.uid}/foodEntries/${newId}`;
      if (!navigator.onLine) {
        offlineQueue.enqueue('ADD_FOOD_ENTRY', user.uid, newEntry);
        showToast(`Logged "${newEntry.foodName}" (saved offline · queued for sync)`);
        return;
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'foodEntries', newId), {
          ...newEntry,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        showToast(`Logged "${newEntry.foodName}" (+${newEntry.calories} kcal)`);
      } catch (err: any) {
        if (!navigator.onLine || err?.message?.includes('the client is offline') || err?.message?.includes('network')) {
          offlineQueue.enqueue('ADD_FOOD_ENTRY', user.uid, newEntry);
          showToast(`Logged "${newEntry.foodName}" (queued for cloud sync)`);
        } else {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
    } else {
      showToast(`Logged "${newEntry.foodName}" (+${newEntry.calories} kcal)`);
    }
  };

  const updateFoodEntry = async (id: string, updates: Partial<FoodEntry>) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );

    if (user) {
      const path = `users/${user.uid}/foodEntries/${id}`;
      if (!navigator.onLine) {
        offlineQueue.enqueue('UPDATE_FOOD_ENTRY', user.uid, { id, updates });
        showToast('Entry updated (saved offline · queued for sync)');
        return;
      }

      try {
        await updateDoc(doc(db, 'users', user.uid, 'foodEntries', id), {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        showToast('Food entry updated');
      } catch (err: any) {
        if (!navigator.onLine || err?.message?.includes('the client is offline') || err?.message?.includes('network')) {
          offlineQueue.enqueue('UPDATE_FOOD_ENTRY', user.uid, { id, updates });
          showToast('Entry updated (queued for cloud sync)');
        } else {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }
    } else {
      showToast('Food entry updated');
    }
  };

  const deleteFoodEntry = async (id: string) => {
    const item = entries.find((e) => e.id === id);
    setEntries((prev) => prev.filter((e) => e.id !== id));

    if (user) {
      const path = `users/${user.uid}/foodEntries/${id}`;
      if (!navigator.onLine) {
        offlineQueue.enqueue('DELETE_FOOD_ENTRY', user.uid, { id });
        showToast(`Removed "${item?.foodName || 'Item'}" (saved offline · queued for sync)`);
        return;
      }

      try {
        await deleteDoc(doc(db, 'users', user.uid, 'foodEntries', id));
        showToast(`Removed "${item?.foodName || 'Item'}" from log`);
      } catch (err: any) {
        if (!navigator.onLine || err?.message?.includes('the client is offline') || err?.message?.includes('network')) {
          offlineQueue.enqueue('DELETE_FOOD_ENTRY', user.uid, { id });
          showToast(`Removed "${item?.foodName || 'Item'}" (queued for cloud sync)`);
        } else {
          handleFirestoreError(err, OperationType.DELETE, path);
        }
      }
    } else {
      showToast(`Removed "${item?.foodName || 'Item'}" from log`);
    }
  };

  const addCustomFood = async (foodData: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
    const newId = `food-${Date.now()}`;
    const newFood: FoodItem = {
      ...foodData,
      id: newId,
      isCustom: true
    };

    setFoods((prev) => [newFood, ...prev]);

    if (user) {
      const path = `users/${user.uid}/customFoods/${newId}`;
      const customPayload = {
        id: newFood.id,
        userId: user.uid,
        name: newFood.name,
        servingSize: newFood.servingSize,
        calories: newFood.calories,
        protein: newFood.protein,
        carbs: newFood.carbs,
        fiber: newFood.fiber,
        fat: newFood.fat,
        category: newFood.category || 'custom',
        createdAt: new Date().toISOString()
      };

      if (!navigator.onLine) {
        offlineQueue.enqueue('ADD_CUSTOM_FOOD', user.uid, customPayload);
        showToast(`Added "${newFood.name}" (saved offline · queued for sync)`);
        return newFood;
      }

      try {
        await setDoc(doc(db, 'users', user.uid, 'customFoods', newId), customPayload);
        showToast(`Added "${newFood.name}" to Food Database`);
      } catch (err: any) {
        if (!navigator.onLine || err?.message?.includes('the client is offline') || err?.message?.includes('network')) {
          offlineQueue.enqueue('ADD_CUSTOM_FOOD', user.uid, customPayload);
          showToast(`Added "${newFood.name}" (queued for cloud sync)`);
        } else {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
    } else {
      showToast(`Added "${newFood.name}" to Food Database`);
    }

    return newFood;
  };

  // Profile actions
  const updateProfile = async (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));

    if (user) {
      const path = `users/${user.uid}`;
      if (!navigator.onLine) {
        offlineQueue.enqueue('UPDATE_PROFILE', user.uid, updates);
        showToast('Nutritional targets updated (saved offline · queued for sync)');
        return;
      }

      try {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            ...updates,
            uid: user.uid,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        );
        showToast('Nutritional targets updated');
      } catch (err: any) {
        if (!navigator.onLine || err?.message?.includes('the client is offline') || err?.message?.includes('network')) {
          offlineQueue.enqueue('UPDATE_PROFILE', user.uid, updates);
          showToast('Targets updated (queued for cloud sync)');
        } else {
          handleFirestoreError(err, OperationType.UPDATE, path);
        }
      }
    } else {
      showToast('Nutritional targets updated');
    }
  };

  const triggerSync = async () => {
    if (!navigator.onLine) {
      showToast('Device is offline. Connect to internet to sync.');
      return;
    }
    showToast('Syncing offline queue...');
    await offlineQueue.processQueue();
    showToast('Sync completed');
  };

  // Water actions
  const waterIntakeToday = waterData[selectedDate] || 0;

  const addWater = (ml: number) => {
    setWaterData((prev) => {
      const current = prev[selectedDate] || 0;
      const updated = Math.max(0, current + ml);
      return { ...prev, [selectedDate]: updated };
    });
    showToast(`Added +${ml}ml hydration`);
  };

  const setWater = (ml: number) => {
    setWaterData((prev) => ({ ...prev, [selectedDate]: Math.max(0, ml) }));
  };

  // Reset to demo
  const resetToDemoData = () => {
    setProfile(DEFAULT_PROFILE);
    setFoods(INITIAL_FOOD_DATABASE);
    const newSeed = generateSeedEntries();
    setEntries(newSeed);
    setWaterData({ [todayStr]: 2400 });
    setSelectedDate(todayStr);
    showToast('Reset to original demo data');
  };

  const exportDataJSON = () => {
    return JSON.stringify({ profile, foods, entries, waterData }, null, 2);
  };

  const deleteUserData = async (deleteProfileDoc: boolean = false) => {
    if (!user) {
      setEntries([]);
      setFoods(INITIAL_FOOD_DATABASE);
      return;
    }

    try {
      // 1. Delete all food entries in Firestore
      const entriesCol = collection(db, 'users', user.uid, 'foodEntries');
      const snapEntries = await getDocs(entriesCol);
      const deleteEntryPromises = snapEntries.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteEntryPromises);

      // 2. Delete all custom foods in Firestore
      const customCol = collection(db, 'users', user.uid, 'customFoods');
      const snapCustom = await getDocs(customCol);
      const deleteCustomPromises = snapCustom.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deleteCustomPromises);

      // 3. Delete user root profile document if deleting entire account
      if (deleteProfileDoc) {
        await deleteDoc(doc(db, 'users', user.uid));
      }

      // 4. Clear local state
      setEntries([]);
      setFoods(INITIAL_FOOD_DATABASE);
      setWaterData({ [todayStr]: 0 });
    } catch (err) {
      console.error('Failed to purge personal records:', err);
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}`);
    }
  };

  return (
    <NutritionContext.Provider
      value={{
        profile,
        foods,
        entries,
        selectedDate,
        activeTab,
        setActiveTab,
        isAddModalOpen,
        setIsAddModalOpen,
        selectedMealForAdd,
        setSelectedMealForAdd,
        editingEntry,
        setEditingEntry,
        toastMessage,
        showToast,
        setSelectedDate,
        previousDay,
        nextDay,
        goToToday,
        isToday,
        canGoNext,
        todayEntries,
        selectedDateEntries,
        todayTotals,
        selectedDateTotals,
        addFoodEntry,
        updateFoodEntry,
        deleteFoodEntry,
        addCustomFood,
        updateProfile,
        waterIntakeToday,
        addWater,
        setWater,
        isOnline,
        offlineSyncStatus,
        pendingSyncCount,
        triggerSync,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        resetToDemoData,
        exportDataJSON,
        deleteUserData
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = (): NutritionContextType => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
