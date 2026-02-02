import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ShoppingItem } from '../lib/database.types';
import { useAuth } from './useAuth';

export function useShoppingList() {
    const { user } = useAuth();
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('shopping_items')
            .select('*')
            .order('is_checked', { ascending: true })
            .order('created_at', { ascending: false });

        if (!error && data) {
            setItems(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchItems();
        }
    }, [user]);

    const addItem = async (item: Omit<ShoppingItem, 'id' | 'created_at' | 'created_by'>) => {
        if (!user) return { error: 'Not authenticated' };

        const { data, error } = await supabase
            .from('shopping_items')
            .insert({
                ...item,
                created_by: user.id,
            })
            .select()
            .single();

        if (!error && data) {
            setItems(prev => [data, ...prev]);
            return { data };
        }
        return { error: error?.message };
    };

    const toggleCheck = async (id: string, isChecked: boolean) => {
        const { data, error } = await supabase
            .from('shopping_items')
            .update({ is_checked: isChecked })
            .eq('id', id)
            .select()
            .single();

        if (!error && data) {
            setItems(prev => prev.map(item => item.id === id ? data : item));
            return { data };
        }
        return { error: error?.message };
    };

    const deleteItem = async (id: string) => {
        const { error } = await supabase
            .from('shopping_items')
            .delete()
            .eq('id', id);

        if (!error) {
            setItems(prev => prev.filter(item => item.id !== id));
            return { success: true };
        }
        return { error: error.message };
    };

    const totalEstimated = items
        .filter(item => !item.is_checked)
        .reduce((acc, item) => acc + (item.estimated_price || 0), 0);

    return {
        items,
        loading,
        addItem,
        toggleCheck,
        deleteItem,
        refetch: fetchItems,
        totalEstimated,
    };
}
