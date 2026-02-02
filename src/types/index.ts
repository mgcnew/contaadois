export interface User {
    name: string;
    avatar: string;
    role?: string; // e.g. 'Gestora', 'Investidor'
}

export type TabId = 'dashboard' | 'transactions' | 'goals' | 'analytics' | 'calendar' | 'shopping' | 'settings';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    user: string; // 'Ana' or 'Pedro'
    category?: string;
    classification?: 'fixed' | 'variable';
    isShared?: boolean;
}
