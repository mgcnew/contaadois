import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../lib/database.types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    createCouple: (name: string) => Promise<{ data: any; error: any }>;
    updateProfile: (updates: { name?: string; avatar_url?: string | null }) => Promise<{ error: any }>;
    uploadAvatar: (file: File) => Promise<{ publicUrl: string | null; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const updateProfile = async (updates: { name?: string; avatar_url?: string | null }) => {
        if (!user) return { error: 'Not authenticated' };

        const { error } = await (supabase
            .from('profiles') as any)
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (!error) {
            await fetchProfile(user.id);
        }

        return { error };
    };

    const uploadAvatar = async (file: File) => {
        if (!user) return { publicUrl: null, error: 'Not authenticated' };

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload the file to the "avatars" bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return { publicUrl, error: null };
        } catch (error) {
            console.error('Error uploading avatar:', error);
            return { publicUrl: null, error };
        }
    };

    const createCouple = async (name: string) => {
        if (!user) return { data: null, error: 'User not authenticated' };

        // 1. Create the couple
        const { data: couple, error: coupleError } = await (supabase
            .from('couples') as any)
            .insert({ name })
            .select()
            .single();

        if (coupleError) return { data: null, error: coupleError };

        // 2. Update the user profile with the new couple_id
        const { error: profileError } = await (supabase
            .from('profiles') as any)
            .update({ couple_id: (couple as any).id })
            .eq('id', user.id);

        if (profileError) return { data: null, error: profileError };

        // 3. Refresh profile local state
        await fetchProfile(user.id);

        return { data: couple, error: null };
    };

    useEffect(() => {
        let mounted = true;
        let profileFetched = false;
        
        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!mounted) return;
                
                setSession(session);
                setUser(session?.user ?? null);
                
                if (session?.user) {
                    setLoading(false);
                    
                    if (!profileFetched) {
                        profileFetched = true;
                        fetchProfile(session.user.id);
                    }
                } else {
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;
                
                if (event === 'INITIAL_SESSION') return;
                
                setSession(session);
                setUser(session?.user ?? null);
                
                if (session?.user) {
                    setLoading(false);
                    if (!profileFetched) {
                        profileFetched = true;
                        fetchProfile(session.user.id);
                    }
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        // Timeout manual para não travar o app
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 10000);

        try {
            const response = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId);
            
            const { data, error } = response;
            clearTimeout(timeoutId);

            if (error) {
                setProfile(null);
            } else if (data && data.length > 0) {
                setProfile(data[0]);
                if (!data[0].couple_id) {
                    createDefaultCouple(userId, data[0].name);
                }
            } else {
                setProfile(null);
            }
        } catch (err: any) {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const createDefaultCouple = async (userId: string, userName: string) => {
        try {
            const { data: couple, error: cError } = await (supabase
                .from('couples') as any)
                .insert({ name: `Casal de ${userName}` })
                .select()
                .single();
            
            if (!cError && couple) {
                await (supabase.from('profiles') as any)
                    .update({ couple_id: couple.id })
                    .eq('id', userId);
                
                setProfile(prev => prev ? { ...prev, couple_id: couple.id } : null);
            }
        } catch (e) {
            console.error('Error creating default couple:', e);
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signIn,
                signUp,
                signOut,
                createCouple,
                updateProfile,
                uploadAvatar,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
