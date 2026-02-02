import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Challenge } from '../lib/database.types';

export function useChallenges() {
    const { profile } = useAuth();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = async () => {
        if (!profile?.couple_id) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('couple_id', profile.couple_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setChallenges(data || []);
        } catch (error) {
            console.error('Error fetching challenges:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();

        if (!profile?.couple_id) return;

        const channel = supabase
            .channel('challenges_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'challenges',
                    filter: `couple_id=eq.${profile.couple_id}`,
                },
                () => {
                    fetchChallenges();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.couple_id]);

    const addChallenge = async (challenge: Omit<Challenge, 'id' | 'created_at' | 'couple_id' | 'current_amount' | 'status' | 'start_date'>) => {
        if (!profile?.couple_id) return { error: 'Couple not found' };

        const { data, error } = await supabase
            .from('challenges')
            .insert({
                ...challenge,
                couple_id: profile.couple_id,
                current_amount: 0,
                status: 'active',
                start_date: new Date().toISOString(),
            })
            .select()
            .single();

        return { data, error: error?.message };
    };

    const updateChallenge = async (id: string, updates: Partial<Challenge>) => {
        const { data, error } = await supabase
            .from('challenges')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        return { data, error: error?.message };
    };

    const deleteChallenge = async (id: string) => {
        const { error } = await supabase
            .from('challenges')
            .delete()
            .eq('id', id);

        return { error: error?.message };
    };

    return {
        challenges,
        loading,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        refetch: fetchChallenges,
    };
}
