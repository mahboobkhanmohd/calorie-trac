import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { useAuth } from '../context/AuthContext';
import { SecuritySettings } from '../components/SecuritySettings';
import {
  User,
  ShieldCheck,
  Target,
  Flame,
  Droplets,
  RotateCcw,
  Download,
  Upload,
  Save,
  Check,
  Zap,
  Cloud,
  LogOut,
  LogIn,
  Database
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, resetToDemoData, exportDataJSON, setActiveTab, showToast } = useNutrition();
  const { user, signInWithGoogle, logout, isFirebaseReady } = useAuth();

  const [name, setName] = useState(profile.name || 'Elena Vance');
  const [cals, setCals] = useState(profile.targetCalories || 2200);
  const [protein, setProtein] = useState(profile.targetProtein || 140);
  const [carbs, setCarbs] = useState(profile.targetCarbs || 250);
  const [fiber, setFiber] = useState(profile.targetFiber || 30);
  const [fat, setFat] = useState(profile.targetFat || 75);
  const [waterGoal, setWaterGoal] = useState(profile.waterGoalMl || 3000);

  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      targetCalories: Number(cals) || 2200,
      targetProtein: Number(protein) || 140,
      targetCarbs: Number(carbs) || 250,
      targetFiber: Number(fiber) || 30,
      targetFat: Number(fat) || 75,
      waterGoalMl: Number(waterGoal) || 3000
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calora_profile_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Exported CALORA profile & logs JSON');
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 pb-28 md:pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
          <span className="font-display text-xs uppercase tracking-wider text-[#8C8C8E]">
            User Architecture &amp; Target Overrides
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#F5F3EE] tracking-tight">
          Metabolic Profile &amp; Preferences
        </h1>
      </div>

      {/* Cloud Authentication & Firestore Sync Card */}
      <div className="bg-[#19191C] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4D8DFF]/20 to-[#9B7BFF]/20 border border-[#4D8DFF]/30 flex items-center justify-center">
            <Cloud className="w-6 h-6 text-[#4D8DFF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-[#F5F3EE]">Firebase Cloud Database &amp; Auth</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${user ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {user ? 'Cloud Synced' : 'Guest / Local Mode'}
              </span>
            </div>
            <p className="text-xs text-[#8C8C8E] mt-1">
              {user
                ? `Logged in as ${user.email}. Food entries and metabolic profiles sync to Google Cloud Firestore.`
                : 'Sign in with Google to synchronize your daily nutrition log and custom foods across devices in real time.'}
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-full bg-[#212125] hover:bg-[#2a2a2a] text-red-400 hover:text-red-300 font-display text-xs font-semibold border border-red-500/20 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-gray-100 text-black font-display text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-[#19191C] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#FF6B4A]/40 shadow-xl"
              />
            ) : (
              <img
                src="/src/assets/images/avatar_user_1790400567712.jpg"
                alt={name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#FF6B4A]/40 shadow-xl"
              />
            )}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-[#FF6B4A] rounded-full ring-2 ring-[#19191C]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-[#F5F3EE]">{user?.displayName || name}</h2>
            <p className="text-xs text-[#8C8C8E] mt-0.5">
              {profile.age} yrs · {profile.sex === 'male' ? 'Male' : 'Female'} · {profile.heightFt}'{profile.heightIn}" ({profile.heightCm} cm) · {profile.weightLbs} lbs ({profile.weightKg} kg)
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-[#FF6B4A]/15 text-[#FF6B4A] font-display text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#FF6B4A]/20">
                {profile.goal === 'fat_loss' ? 'Fat Oxidation' : profile.goal === 'hypertrophy' ? 'Hypertrophy' : 'Equilibrium'} ({profile.goalDelta > 0 ? `+${profile.goalDelta}` : profile.goalDelta} kcal)
              </span>
              <span className="bg-[#4D8DFF]/15 text-[#AEC6FF] font-display text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#4D8DFF]/20">
                {profile.activityMultiplier}x Active
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('calculator')}
          className="px-4 py-2 rounded-full bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] font-display text-xs font-semibold border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Recalculate BMR / TDEE</span>
        </button>
      </div>

      {/* Target Customization Form */}
      <form onSubmit={handleSaveProfile} className="bg-[#19191C] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/[0.08] flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#FF6B4A]" />
            <h3 className="font-display font-bold text-lg text-[#F5F3EE]">Daily Nutritional Targets</h3>
          </div>
          <span className="text-xs text-[#8C8C8E]">Direct Target Override</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-display text-xs uppercase tracking-wider text-[#8C8C8E] block mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#FF6B4A]/60"
            />
          </div>

          <div>
            <label className="font-display text-xs uppercase tracking-wider text-[#FF6B4A] block mb-1.5 font-bold">
              Daily Calorie Target (kcal)
            </label>
            <input
              type="number"
              min="1000"
              max="6000"
              value={cals}
              onChange={(e) => setCals(parseInt(e.target.value) || 2200)}
              className="w-full bg-[#121214] border border-[#FF6B4A]/40 text-[#F5F3EE] font-display font-bold text-sm px-4 py-2.5 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#121214] p-3.5 rounded-xl border border-white/[0.06]">
            <label className="font-display text-[11px] uppercase tracking-wider text-[#4D8DFF] block mb-1 font-bold">
              Protein Target (g)
            </label>
            <input
              type="number"
              min="20"
              max="400"
              value={protein}
              onChange={(e) => setProtein(parseInt(e.target.value) || 140)}
              className="w-full bg-transparent font-display font-bold text-xl text-[#F5F3EE] focus:outline-none"
            />
            <span className="text-[10px] text-[#8C8C8E]">{protein * 4} kcal</span>
          </div>

          <div className="bg-[#121214] p-3.5 rounded-xl border border-white/[0.06]">
            <label className="font-display text-[11px] uppercase tracking-wider text-[#FF6B4A] block mb-1 font-bold">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              min="20"
              max="800"
              value={carbs}
              onChange={(e) => setCarbs(parseInt(e.target.value) || 250)}
              className="w-full bg-transparent font-display font-bold text-xl text-[#F5F3EE] focus:outline-none"
            />
            <span className="text-[10px] text-[#8C8C8E]">{carbs * 4} kcal</span>
          </div>

          <div className="bg-[#121214] p-3.5 rounded-xl border border-white/[0.06]">
            <label className="font-display text-[11px] uppercase tracking-wider text-[#9B7BFF] block mb-1 font-bold">
              Fiber Floor (g)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={fiber}
              onChange={(e) => setFiber(parseInt(e.target.value) || 30)}
              className="w-full bg-transparent font-display font-bold text-xl text-[#F5F3EE] focus:outline-none"
            />
            <span className="text-[10px] text-[#8C8C8E]">Gut microbiome</span>
          </div>

          <div className="bg-[#121214] p-3.5 rounded-xl border border-white/[0.06]">
            <label className="font-display text-[11px] uppercase tracking-wider text-white block mb-1 font-bold">
              Fat Limit (g)
            </label>
            <input
              type="number"
              min="10"
              max="200"
              value={fat}
              onChange={(e) => setFat(parseInt(e.target.value) || 75)}
              className="w-full bg-transparent font-display font-bold text-xl text-[#F5F3EE] focus:outline-none"
            />
            <span className="text-[10px] text-[#8C8C8E]">{fat * 9} kcal</span>
          </div>
        </div>

        <div>
          <label className="font-display text-xs uppercase tracking-wider text-[#4D8DFF] block mb-1.5">
            Cellular Hydration Daily Goal (ml)
          </label>
          <input
            type="number"
            min="1000"
            max="8000"
            step="100"
            value={waterGoal}
            onChange={(e) => setWaterGoal(parseInt(e.target.value) || 3000)}
            className="w-full max-w-sm bg-[#121214] border border-white/[0.08] text-[#F5F3EE] text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#4D8DFF]/60"
          />
        </div>

        <button
          type="submit"
          className="self-start px-6 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#ff7a5c] text-[#101010] font-display text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Targets Saved & Synchronized to Cloud' : 'Save Changes to Targets'}</span>
        </button>
      </form>

      {/* Security & Data Governance */}
      <div className="bg-[#19191C] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/[0.08]">
        <SecuritySettings />
      </div>

      {/* Data Management Section */}
      <div className="bg-[#19191C] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/[0.08] flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="font-display font-bold text-lg text-[#F5F3EE]">Client Persistence &amp; Reset</h3>
          <span className="text-xs text-[#8C8C8E]">Database &amp; Storage</span>
        </div>

        <p className="text-xs text-[#8C8C8E] leading-relaxed">
          Your profile, daily logs, custom food additions, and calculated targets are persisted in Google Cloud Firestore (when signed in) and locally in browser storage. You can export a JSON backup or restore default demo data at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={resetToDemoData}
            className="px-5 py-2.5 rounded-full bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] font-display text-xs font-semibold border border-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#FF6B4A]" />
            <span>Reset to Default Demo Data</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-5 py-2.5 rounded-full bg-[#212125] hover:bg-[#2a2a2a] text-[#F5F3EE] font-display text-xs font-semibold border border-white/[0.08] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-[#4D8DFF]" />
            <span>Export Backup JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
