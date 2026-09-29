import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
const PROFILE_KEY = 'spendly.localGuest.profile';
const ACTIVE_KEY = 'spendly.localGuest.active';
export interface LocalGuest { id: string; name: string; createdAt: string }
interface GuestSessionValue { ready: boolean; active: boolean; hasGuest: boolean; logoutRequested: boolean; profile: LocalGuest | null; startGuest: () => Promise<void>; requestLogout: () => void; cancelLogout: () => void; signOut: () => Promise<void>; updateGuestName: (name: string) => Promise<void> }
const GuestSessionContext = createContext<GuestSessionValue | null>(null);
export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false); const [active, setActive] = useState(false); const [profile, setProfile] = useState<LocalGuest | null>(null); const [logoutRequested, setLogoutRequested] = useState(false);
  useEffect(() => { let mounted = true; Promise.all([AsyncStorage.getItem(PROFILE_KEY), AsyncStorage.getItem(ACTIVE_KEY)]).then(([raw, status]) => { if (!mounted) return; if (raw) { try { setProfile(JSON.parse(raw) as LocalGuest); } catch { setProfile(null); } } setActive(status === 'true'); setReady(true); }).catch(() => { if (mounted) setReady(true); }); return () => { mounted = false; }; }, []);
  const startGuest = useCallback(async () => { let guest = profile; if (!guest) { guest = { id: 'guest-' + Date.now().toString(36), name: 'Guest', createdAt: new Date().toISOString() }; await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(guest)); setProfile(guest); } await AsyncStorage.setItem(ACTIVE_KEY, 'true'); setLogoutRequested(false); setActive(true); }, [profile]);
  const requestLogout = useCallback(() => setLogoutRequested(true), []); const cancelLogout = useCallback(() => setLogoutRequested(false), []);
  const signOut = useCallback(async () => { await AsyncStorage.setItem(ACTIVE_KEY, 'false'); setActive(false); setLogoutRequested(false); }, []);
  const updateGuestName = useCallback(async (name: string) => { if (!profile) return; const next = { ...profile, name: name.trim() || 'Guest' }; await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setProfile(next); }, [profile]);
  const value = useMemo(() => ({ ready, active, hasGuest: Boolean(profile), logoutRequested, profile, startGuest, requestLogout, cancelLogout, signOut, updateGuestName }), [ready, active, profile, logoutRequested, startGuest, requestLogout, cancelLogout, signOut, updateGuestName]);
  return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>;
}
export function useGuestSession() { const context = useContext(GuestSessionContext); if (!context) throw new Error('useGuestSession must be used inside GuestSessionProvider'); return context; }
