import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Budget } from '../lib/database.types';

export function useBudgets() {
    const { profile } = useAuth();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.couple_id) {
            setLoading(false);
            return;
        }

        fetchBudgets();

        // Realtime subscription
        const channel = supabase
            .channel('budgets_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'budgets',
                    filter: `couple_id=eq.${profile.couple_id}`,
                },
                () => {
                    fetchBudgets();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.couple_id]);

    const fetchBudgets = async () => {
        try {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('couple_id', profile!.couple_id!)
                .order('category');

            if (error) throw error;
            setBudgets(data || []);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveBudget = async (category: string, amount: number) => {
        if (!profile?.couple_id) return { error: 'Couple not found' };

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        // Check if budget already exists for this category/month/year
        const { data: existing } = await supabase
            .from('budgets')
            .select('id')
            .eq('couple_id', profile.couple_id)
            .eq('category', category)
            .eq('month', month)
            .eq('year', year)
            .single();

        if (existing) {
            const { error } = await (supabase
                .from('budgets') as any)
                .update({ amount })
                .eq('id', (existing as any).id);
            return { error };
        } else {
            const { error } = await (supabase
                .from('budgets') as any)
                .insert({
                    couple_id: profile.couple_id,
                    category,
                    amount,
                    month,
                    year,
                });
            return { error };
        }
    };

    const deleteBudget = async (id: string) => {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);
        return { error };
    };

    return {
        budgets,
        loading,
        saveBudget,
        deleteBudget,
        refresh: fetchBudgets,
    };
}
