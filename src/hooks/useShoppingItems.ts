import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ShoppingItem } from '../lib/database.types';
import { useAuth } from './useAuth';

export function useShoppingItems() {
    const { user, profile } = useAuth();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            let query = supabase.from('shopping_items').select('*');
            
            if (profile?.couple_id) {
                query = query.or(`couple_id.eq.${profile.couple_id},created_by.eq.${user.id}`);
            } else {
                query = query.eq('created_by', user.id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching shopping items:', error);
                setError(error.message);
            } else {
                setItems(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('Erro ao carregar lista de compras');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && profile?.couple_id) {
            fetchItems();
        }
    }, [profile?.couple_id]);

    useEffect(() => {
        if (!user) {
            setItems([]);
            setLoading(false);
            return;
        }

        fetchItems();

        // Listen for manual updates
        const handleManualUpdate = () => fetchItems();
        window.addEventListener('shopping-updated', handleManualUpdate);

        // Realtime subscription
        let channel: any = null;
        if (profile?.couple_id) {
            channel = supabase
                .channel('shopping_items_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'shopping_items',
                        filter: `couple_id=eq.${profile.couple_id}`
                    },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setItems(prev => {
                                if (prev.some(i => i.id === payload.new.id)) return prev;
                                return [payload.new as ShoppingItem, ...prev];
                            });
                        } else if (payload.eventType === 'DELETE') {
                            setItems(prev => prev.filter(i => i.id !== payload.old.id));
                        } else if (payload.eventType === 'UPDATE') {
                            setItems(prev => prev.map(i => i.id === payload.new.id ? payload.new as ShoppingItem : i));
                        }
                    }
                )
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
            window.removeEventListener('shopping-updated', handleManualUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, profile?.couple_id]);

    const addItem = async (item: Omit<ShoppingItem, 'id' | 'created_at' | 'created_by' | 'couple_id'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await (supabase
            .from('shopping_items') as any)
            .insert({
                ...item,
                created_by: user.id,
                couple_id: profile?.couple_id || null,
            })
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        setItems(prev => [data as ShoppingItem, ...prev]);
        window.dispatchEvent(new CustomEvent('shopping-updated'));
        return { data: data as ShoppingItem };
    };

    const updateItem = async (id: string, updates: Partial<Omit<ShoppingItem, 'id' | 'created_at' | 'created_by' | 'couple_id'>>) => {
        const { data, error } = await (supabase
            .from('shopping_items') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return { error: error.message };
        }

        setItems(prev => prev.map(i => i.id === id ? data as ShoppingItem : i));
        return { data: data as ShoppingItem };
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase
            .from('shopping_items')
            .delete()
            .eq('id', id);

        if (error) {
            return { error: error.message };
        }

        setItems(prev => prev.filter(i => i.id !== id));
        return { success: true };
    };

    const toggleCheck = async (id: string, isChecked: boolean) => {
        return updateItem(id, { is_checked: isChecked });
    };

    return {
        items,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        toggleCheck,
        refetch: fetchItems,
    };
}
