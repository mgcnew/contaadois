import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Goal } from '../lib/database.types';
import { useAuth } from './useAuth';

export function useGoals() {
    const { user, profile } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            let query = supabase.from('goals').select('*');
            
            if (profile?.couple_id) {
                query = query.or(`couple_id.eq.${profile.couple_id},created_by.eq.${user.id}`);
            } else {
                query = query.eq('created_by', user.id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching goals:', error);
                setError(error.message);
            } else {
                setGoals(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Erro ao carregar metas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && profile?.couple_id) {
            fetchGoals();
        }
    }, [profile?.couple_id]);

    useEffect(() => {
        if (!user) {
            setGoals([]);
            setLoading(false);
            return;
        }

        fetchGoals();

        // Listen for manual updates
        const handleManualUpdate = () => fetchGoals();
        window.addEventListener('goals-updated', handleManualUpdate);

        // Realtime subscription
        let channel: any = null;
        if (profile?.couple_id) {
            channel = supabase
                .channel('goals_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'goals',
                        filter: `couple_id=eq.${profile.couple_id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setGoals(prev => {
                                if (prev.some(g => g.id === payload.new.id)) return prev;
                                return [payload.new as Goal, ...prev];
                            });
                        } else if (payload.eventType === 'DELETE') {
                            setGoals(prev => prev.filter(g => g.id !== payload.old.id));
                        } else if (payload.eventType === 'UPDATE') {
                            setGoals(prev => prev.map(g => g.id === payload.new.id ? payload.new as Goal : g));
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
            window.removeEventListener('goals-updated', handleManualUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, profile?.couple_id]);

    const addGoal = async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'couple_id'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await (supabase
            .from('goals') as any)
            .insert({
                title: goal.title,
                target_amount: goal.target_amount,
                current_amount: goal.current_amount || 0,
                icon: goal.icon || 'target',
                deadline: goal.deadline || null,
                created_by: user.id,
                couple_id: profile?.couple_id || null,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        setGoals(prev => [data as Goal, ...prev]);
        window.dispatchEvent(new CustomEvent('goals-updated'));
        return { data: data as Goal };
    };

    const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'created_at' | 'created_by'>>) => {
        const { data, error } = await (supabase
            .from('goals') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        setGoals(prev => prev.map(g => g.id === id ? data as Goal : g));
        return { data: data as Goal };
    };

    const deleteGoal = async (id: string) => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: error.message };
        }

        setGoals(prev => prev.filter(g => g.id !== id));
        return { success: true };
    };

    return {
        goals,
        loading,
        error,
        addGoal,
        updateGoal,
        deleteGoal,
        refetch: fetchGoals,
    };
}
