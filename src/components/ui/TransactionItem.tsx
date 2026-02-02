import { ShoppingCart, DollarSign, Utensils, Home, Zap, Briefcase } from 'lucide-react';
import type { Transaction } from '../../lib/database.types';
import clsx from 'clsx';
import { formatCurrency } from '../../lib/formatters';

interface TransactionItemProps {
    transaction: Transaction;
    detailed?: boolean;
}


// Start with a mock icon logic based on category or random if not present
const getIcon = (category: string) => {
    // Simple mapping for demo based on strings in original HTML
    if (category.includes('Supermercado') || category.includes('cart')) return ShoppingCart;
    if (category.includes('Freelance') || category.includes('dollar')) return DollarSign;
    if (category.includes('Jantar') || category.includes('utensils')) return Utensils;
    if (category.includes('Aluguel') || category.includes('house')) return Home;
    if (category.includes('Luz') || category.includes('zap')) return Zap;
    if (category.includes('Salário') || category.includes('briefcase')) return Briefcase;
    return ShoppingCart;
};

export function TransactionItem({ transaction }: TransactionItemProps) {
    const Icon = getIcon(transaction.title + (transaction.category || ''));
    const isIncome = transaction.type === 'income';
    const colorClass = isIncome ? 'text-emerald-500' : 'text-rose-500';

    return (
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className={clsx("w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform", colorClass)}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{transaction.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{transaction.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        {transaction.isShared && (
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-medium">Compartilhado</span>
                        )}
                        {!transaction.isShared && (
                            <span className="flex items-center gap-1">{transaction.user}</span>
                        )}
                        {/* If we had user avatar url we could show it like in HTML */}
                    </div>
                </div>
            </div>
            <span className={clsx("font-semibold", colorClass)} data-value>
                {isIncome ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.amount))}
            </span>
        </div>
    );
}
