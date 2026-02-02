import { Funnel, X } from 'lucide-react';
import { TransactionItem } from '../ui/TransactionItem';
import { useTransactions } from '../../hooks/useTransactions';
import { useState, useEffect, useRef } from 'react';

export function TransactionsList() {
    const { transactions, loading } = useTransactions();
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const filterMenuRef = useRef<HTMLDivElement>(null);

    // Close filter menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
        };

        if (showFilterMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showFilterMenu]);

    // Get unique categories
    const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean))) as string[];

    // Apply filters
    const filteredTransactions = transactions.filter(t => {
        // Type filter
        if (filter !== 'all' && t.type !== filter) return false;
        
        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        
        // Date filter
        if (dateFilter !== 'all') {
            // Criar data da transação sem fuso horário para comparação correta
            const [y, m, d] = t.date.split('T')[0].split('-').map(Number);
            const transactionDate = new Date(y, m - 1, d);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateFilter === 'today') {
                if (transactionDate.getTime() !== today.getTime()) return false;
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                if (transactionDate < weekAgo) return false;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                if (transactionDate < monthAgo) return false;
            }
        }
        
        return true;
    });

    const clearFilters = () => {
        setFilter('all');
        setCategoryFilter('all');
        setDateFilter('all');
    };

    const hasActiveFilters = filter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Extrato Completo</h2>
                <div className="relative" ref={filterMenuRef}>
                    <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Funnel className="w-4 h-4" /> 
                        Filtrar
                        {hasActiveFilters && (
                            <span className="w-2 h-2 bg-violet-600 rounded-full"></span>
                        )}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilterMenu && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-10 p-4 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filtros</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> Limpar
                                    </button>
                                )}
                            </div>

                            {/* Period Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2">Período</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setDateFilter('all')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                            dateFilter === 'all'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Todos
                                    </button>
                                    <button
                                        onClick={() => setDateFilter('today')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                            dateFilter === 'today'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        Hoje
                                    </button>
                                    <button
                                        onClick={() => setDateFilter('week')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                            dateFilter === 'week'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        7 dias
                                    </button>
                                    <button
                                        onClick={() => setDateFilter('month')}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                            dateFilter === 'month'
                                                ? 'bg-violet-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        30 dias
                                    </button>
                                </div>
                            </div>

                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-2">Categoria</label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        <option value="all">Todas</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={() => setShowFilterMenu(false)}
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                            >
                                Aplicar Filtros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Chips (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button 
                    onClick={() => setFilter('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                        filter === 'all' 
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition-colors'
                    }`}
                >
                    Todos
                </button>
                <button 
                    onClick={() => setFilter('income')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                        filter === 'income' 
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition-colors'
                    }`}
                >
                    Entradas
                </button>
                <button 
                    onClick={() => setFilter('expense')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ${
                        filter === 'expense' 
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 transition-colors'
                    }`}
                >
                    Saídas
                </button>
            </div>

            {/* Full List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {filteredTransactions.length} Transações
                </div>
                {filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        <p>Nenhuma transação encontrada</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredTransactions.map(t => (
                            <TransactionItem key={t.id} transaction={t} detailed />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
