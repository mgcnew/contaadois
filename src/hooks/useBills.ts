import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../lib/database.types';
import { useAuth } from './useAuth';

export function useBills() {
    const { user, profile } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBills = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            let query = supabase.from('bills').select('*');
            
            if (profile?.couple_id) {
                query = query.or(`couple_id.eq.${profile.couple_id},created_by.eq.${user.id}`);
            } else {
                query = query.eq('created_by', user.id);
            }

            const { data, error } = await query.order('due_date', { ascending: true });

            if (error) {
                console.error('Error fetching bills:', error);
                setError(error.message);
            } else {
                setBills(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Erro ao carregar contas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && profile?.couple_id) {
            fetchBills();
        }
    }, [profile?.couple_id]);

    useEffect(() => {
        if (!user) {
            setBills([]);
            setLoading(false);
            return;
        }

        fetchBills();

        // Listen for manual updates
        const handleManualUpdate = () => fetchBills();
        window.addEventListener('bills-updated', handleManualUpdate);

        // Realtime subscription
        let channel: any = null;
        if (profile?.couple_id) {
            channel = supabase
                .channel('bills_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'bills',
                        filter: `couple_id=eq.${profile.couple_id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setBills(prev => {
                                if (prev.some(b => b.id === payload.new.id)) return prev;
                                return [...prev, payload.new as Bill];
                            });
                        } else if (payload.eventType === 'DELETE') {
                            setBills(prev => prev.filter(b => b.id !== payload.old.id));
                        } else if (payload.eventType === 'UPDATE') {
                            setBills(prev => prev.map(b => b.id === payload.new.id ? payload.new as Bill : b));
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
            window.removeEventListener('bills-updated', handleManualUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, profile?.couple_id]);

    const addBill = async (bill: Omit<Bill, 'id' | 'created_at' | 'created_by' | 'couple_id'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await (supabase
            .from('bills') as any)
            .insert({
                title: bill.title,
                amount: bill.amount,
                due_date: bill.due_date,
                status: bill.status || 'pending',
                category: bill.category || null,
                is_recurring: bill.is_recurring || false,
                created_by: user.id,
                couple_id: profile?.couple_id || null,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        setBills(prev => [...prev, data as Bill]);
        window.dispatchEvent(new CustomEvent('bills-updated'));
        return { data: data as Bill };
    };

    const updateBill = async (id: string, updates: Partial<Omit<Bill, 'id' | 'created_at' | 'created_by' | 'couple_id'>>) => {
        const { data: currentBill } = await supabase.from('bills').select('*').eq('id', id).single();
        
        const { data, error } = await (supabase
            .from('bills') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        // Logic for recurring bills: if marked as paid and is_recurring, create next month's bill
        if (updates.status === 'paid' && currentBill && (currentBill as Bill).is_recurring && (currentBill as Bill).status !== 'paid') {
            const nextDueDate = new Date((currentBill as Bill).due_date);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);

            await (supabase.from('bills') as any).insert({
                title: (currentBill as Bill).title,
                amount: (currentBill as Bill).amount,
                due_date: nextDueDate.toISOString().split('T')[0],
                status: 'pending',
                category: (currentBill as Bill).category,
                is_recurring: true,
                created_by: (currentBill as Bill).created_by,
                couple_id: (currentBill as Bill).couple_id
            });
        }

        setBills(prev => prev.map(b => b.id === id ? data as Bill : b));
        return { data: data as Bill };
    };

    const deleteBill = async (id: string) => {
        const { error } = await supabase
            .from('bills')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: error.message };
        }

        setBills(prev => prev.filter(b => b.id !== id));
        return { success: true };
    };

    return {
        bills,
        loading,
        error,
        addBill,
        updateBill,
        deleteBill,
        refetch: fetchBills,
    };
}
