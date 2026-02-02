export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            couples: {
                Row: {
                    id: string
                    name: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    name: string
                    avatar_url: string | null
                    couple_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name: string
                    avatar_url?: string | null
                    couple_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    avatar_url?: string | null
                    couple_id?: string | null
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    created_by: string
                    couple_id: string | null
                    title: string
                    amount: number
                    type: 'income' | 'expense'
                    category: string | null
                    is_shared: boolean
                    date: string
                    classification: 'fixed' | 'variable' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    created_by: string
                    couple_id?: string | null
                    title: string
                    amount: number
                    type: 'income' | 'expense'
                    category?: string | null
                    is_shared?: boolean
                    date?: string
                    classification?: 'fixed' | 'variable' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    created_by?: string
                    couple_id?: string | null
                    title?: string
                    amount?: number
                    type?: 'income' | 'expense'
                    category?: string | null
                    is_shared?: boolean
                    date?: string
                    classification?: 'fixed' | 'variable' | null
                }
            }
            goals: {
                Row: {
                    id: string
                    created_by: string
                    couple_id: string | null
                    title: string
                    target_amount: number
                    current_amount: number
                    icon: string
                    deadline: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    created_by: string
                    couple_id?: string | null
                    title: string
                    target_amount: number
                    current_amount?: number
                    icon?: string
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string | null
                    title?: string
                    target_amount?: number
                    current_amount?: number
                    icon?: string
                    deadline?: string | null
                    updated_at?: string
                }
            }
            bills: {
                Row: {
                    id: string
                    created_by: string
                    couple_id: string | null
                    title: string
                    amount: number
                    due_date: string
                    status: 'pending' | 'paid' | 'overdue'
                    category: string | null
                    is_recurring: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    created_by: string
                    couple_id?: string | null
                    title: string
                    amount: number
                    due_date: string
                    status?: 'pending' | 'paid' | 'overdue'
                    category?: string | null
                    is_recurring?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string | null
                    title?: string
                    amount?: number
                    due_date?: string
                    status?: 'pending' | 'paid' | 'overdue'
                    category?: string | null
                    is_recurring?: boolean
                }
            }
            shopping_items: {
                Row: {
                    id: string
                    created_by: string
                    couple_id: string | null
                    name: string
                    quantity: number
                    estimated_price: number | null
                    is_checked: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    created_by: string
                    couple_id?: string | null
                    name: string
                    quantity?: number
                    estimated_price?: number | null
                    is_checked?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string | null
                    name?: string
                    quantity?: number
                    estimated_price?: number | null
                    is_checked?: boolean
                }
            }
            categories: {
                Row: {
                    id: string
                    couple_id: string | null
                    name: string
                    icon: string | null
                    color: string | null
                    type: 'income' | 'expense'
                    created_at: string
                }
                Insert: {
                    id?: string
                    couple_id?: string | null
                    name: string
                    icon?: string | null
                    color?: string | null
                    type: 'income' | 'expense'
                    created_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string | null
                    name?: string
                    icon?: string | null
                    color?: string | null
                    type?: 'income' | 'expense'
                }
            }
            budgets: {
                Row: {
                    id: string
                    couple_id: string
                    category: string
                    amount: number
                    month: number
                    year: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    category: string
                    amount: number
                    month: number
                    year: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    couple_id?: string
                    category?: string
                    amount?: number
                    month?: number
                    year?: number
                }
            }
            challenges: {
                Row: {
                    id: string
                    couple_id: string
                    title: string
                    description: string | null
                    target_amount: number
                    current_amount: number
                    start_date: string
                    end_date: string
                    category: string | null
                    status: 'active' | 'completed' | 'failed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    couple_id: string
                    title: string
                    description?: string | null
                    target_amount: number
                    current_amount?: number
                    start_date?: string
                    end_date: string
                    category?: string | null
                    status?: 'active' | 'completed' | 'failed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    target_amount?: number
                    current_amount?: number
                    end_date?: string
                    category?: string | null
                    status?: 'active' | 'completed' | 'failed'
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_my_couple_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Bill = Database['public']['Tables']['bills']['Row'];
export type ShoppingItem = Database['public']['Tables']['shopping_items']['Row'];
export type Couple = Database['public']['Tables']['couples']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Budget = Database['public']['Tables']['budgets']['Row'];
export type Challenge = Database['public']['Tables']['challenges']['Row'];
