import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction } from '../lib/database.types';
import { useAuth } from './useAuth';

export function useTransactions() {
    const { user, profile } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            let query = supabase.from('transactions').select('*');
            
            if (profile?.couple_id) {
                query = query.or(`couple_id.eq.${profile.couple_id},created_by.eq.${user.id}`);
            } else {
                query = query.eq('created_by', user.id);
            }

            const { data, error } = await query
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setTransactions(data || []);
            }
        } catch (err) {
            setError('Erro ao carregar transações');
        } finally {
            setLoading(false);
        }
    };

    // Refetch automático quando o perfil (e o couple_id) carregar
    useEffect(() => {
        if (user && profile?.couple_id) {
            fetchTransactions();
        }
    }, [profile?.couple_id]);

    useEffect(() => {
        if (!user) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        fetchTransactions();

        // Listen for manual updates
        const handleManualUpdate = () => fetchTransactions();
        window.addEventListener('transactions-updated', handleManualUpdate);

        // Realtime subscription (apenas se tiver casal)
        let channel: any = null;
        if (profile?.couple_id) {
            channel = supabase
                .channel('transactions_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'transactions',
                        filter: `couple_id=eq.${profile.couple_id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setTransactions(prev => {
                                if (prev.some(t => t.id === payload.new.id)) return prev;
                                return [payload.new as Transaction, ...prev];
                            });
                        } else if (payload.eventType === 'DELETE') {
                            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
                        } else if (payload.eventType === 'UPDATE') {
                            setTransactions(prev => prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t));
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
            window.removeEventListener('transactions-updated', handleManualUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, profile?.couple_id]);

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'created_by' | 'couple_id'>) => {
        if (!user) return { error: 'Not authenticated' };

        if (!profile?.couple_id) {
            return { error: 'Perfil incompleto: couple_id não encontrado. Por favor, recarregue a página.' };
        }

        const payload = {
            ...transaction,
            created_by: user.id,
            couple_id: profile.couple_id,
        };
        
        const { data, error } = await (supabase
            .from('transactions') as any)
            .insert(payload)
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        const newTransaction = data as Transaction;
        
        setTransactions(prev => [newTransaction, ...prev]);
        window.dispatchEvent(new CustomEvent('transactions-updated'));
        
        return { data: newTransaction };
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await (supabase
            .from('transactions') as any)
            .delete()
            .eq('id', id);

        return { error };
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        const { data, error } = await (supabase
            .from('transactions') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        return { data: data as Transaction, error };
    };

    const canDelete = (transaction: Transaction) => {
        return user?.id === transaction.created_by;
    };

    // Calculate totals
    const totals = transactions.reduce(
        (acc, t) => {
            if (t.type === 'income') {
                acc.income += Number(t.amount);
            } else {
                acc.expense += Number(t.amount);
            }
            return acc;
        },
        { income: 0, expense: 0 }
    );

    return {
        transactions,
        loading,
        error,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        canDelete,
        refetch: fetchTransactions,
        totals,
        balance: totals.income - totals.expense,
    };
}
