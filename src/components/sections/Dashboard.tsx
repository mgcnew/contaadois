import { TrendingUp, Plus, Calendar, ShoppingCart, Target, CheckCircle2 } from 'lucide-react';
import { TransactionItem } from '../ui/TransactionItem';
import { useTransactions } from '../../hooks/useTransactions';
import { useBills } from '../../hooks/useBills';
import { useGoals } from '../../hooks/useGoals';
import { useShoppingList } from '../../hooks/useShoppingList';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../lib/formatters';
import { useMemo } from 'react';
import clsx from 'clsx';

interface DashboardProps {
    onSwitchTab: () => void;
}

export function Dashboard({ onSwitchTab }: DashboardProps) {
    const { transactions, loading: loadingTransactions, balance, totals } = useTransactions();
    const { bills, loading: loadingBills } = useBills();
    const { goals, loading: loadingGoals } = useGoals();
    const { items: shoppingItems, loading: loadingShopping } = useShoppingList();
    const { profile } = useAuth();
    
    const loading = loadingTransactions || loadingBills || loadingGoals || loadingShopping;

    const recentTransactions = transactions.slice(0, 3);

    // Cálculo real para o gráfico de balanço
    const chartData = useMemo(() => {
        const total = totals.income + totals.expense;
        if (total === 0) return { incomePercent: 0, expensePercent: 0, strokeDasharray: "0 100" };
        
        const incomePercent = Math.round((totals.income / total) * 100);
        const expensePercent = 100 - incomePercent;
        
        // Para um gráfico SVG simples, 2 * PI * r (onde r=15.9155 para perímetro 100)
        return { 
            incomePercent, 
            expensePercent,
            total
        };
    }, [totals]);
    
    // Combined activity feed
    const activities = useMemo(() => {
        const feed: any[] = [];

        // Add Transactions
        transactions.slice(0, 5).forEach(t => {
            feed.push({
                id: `trans-${t.id}`,
                type: 'transaction',
                title: t.title,
                amount: t.amount,
                transType: t.type,
                date: new Date(t.created_at || t.date),
                user: t.created_by === profile?.id ? 'Você' : 'Parceiro(a)',
                icon: t.type === 'income' ? TrendingUp : TrendingUp,
                color: t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
            });
        });

        // Add Bills (paid)
        bills.filter(b => b.status === 'paid').slice(0, 3).forEach(b => {
            feed.push({
                id: `bill-${b.id}`,
                type: 'bill',
                title: b.title,
                amount: b.amount,
                date: new Date(b.created_at),
                user: b.created_by === profile?.id ? 'Você' : 'Parceiro(a)',
                icon: Calendar,
                color: 'text-amber-500'
            });
        });

        // Add Goals (updates)
        goals.slice(0, 2).forEach(g => {
            feed.push({
                id: `goal-${g.id}`,
                type: 'goal',
                title: g.title,
                amount: g.current_amount,
                date: new Date(g.updated_at || g.created_at),
                user: g.created_by === profile?.id ? 'Você' : 'Parceiro(a)',
                icon: Target,
                color: 'text-violet-500'
            });
        });

        // Add Shopping (checked items)
        shoppingItems.filter(i => i.is_checked).slice(0, 3).forEach(i => {
            feed.push({
                id: `shop-${i.id}`,
                type: 'shopping',
                title: i.name,
                date: new Date(i.created_at),
                user: i.created_by === profile?.id ? 'Você' : 'Parceiro(a)',
                icon: ShoppingCart,
                color: 'text-blue-500'
            });
        });

        return feed.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
    }, [transactions, bills, goals, shoppingItems, profile?.id]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in pb-20 md:pb-0">
            {/* Main Balance Card - Compact */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Saldo Total</p>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100" data-value>
                            {formatCurrency(balance)}
                        </h2>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Receitas</p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400" data-value>
                            + {formatCurrency(totals.income)}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Despesas</p>
                        </div>
                        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400" data-value>
                            - {formatCurrency(totals.expense)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Individual Balances - Compact Grid */}
            {profile && (
                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            {profile.avatar_url && (
                                <img src={profile.avatar_url} className="w-8 h-8 rounded-full" alt={profile.name} />
                            )}
                            <div>
                                <p className="text-xs text-slate-500 font-medium">{profile.name}</p>
                            </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(balance)}
                        </p>
                    </div>
                </div>
            )}

            {/* Chart Card - Real Data */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Balanço Mensal</h3>

                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        {/* SVG Donut Chart */}
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            {/* Background Circle (Gray) */}
                            <circle
                                cx="18"
                                cy="18"
                                r="15.9155"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                className="text-slate-100 dark:text-slate-800"
                            />
                            {/* Income Segment (Emerald) */}
                            {chartData.total > 0 && (
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9155"
                                    fill="transparent"
                                    stroke="#10b981" // emerald-500
                                    strokeWidth="3.5"
                                    strokeDasharray={`${chartData.incomePercent} ${100 - chartData.incomePercent}`}
                                    strokeLinecap="round"
                                />
                            )}
                            {/* Expense Segment (Rose) - Overlaying background if total > 0 */}
                            {chartData.total > 0 && chartData.expensePercent > 0 && (
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9155"
                                    fill="transparent"
                                    stroke="#f43f5e" // rose-500
                                    strokeWidth="3.5"
                                    strokeDasharray={`${chartData.expensePercent} ${100 - chartData.expensePercent}`}
                                    strokeDashoffset={-chartData.incomePercent}
                                    strokeLinecap="round"
                                />
                            )}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {chartData.total > 0 ? `${chartData.incomePercent}%` : '0%'}
                            </span>
                            <span className="text-[8px] text-slate-400 uppercase font-medium">Entrada</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Entradas</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(totals.income)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Saídas</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(totals.expense)}
                            </span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-medium uppercase">Total</span>
                            <span className="text-xs font-bold text-slate-500">
                                {formatCurrency(chartData.total)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions - Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Últimas Movimentações</h3>
                    <button
                        onClick={onSwitchTab}
                        className="text-xs text-violet-600 dark:text-violet-400 font-medium"
                    >
                        Ver tudo
                    </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTransactions.map(t => (
                        <TransactionItem key={t.id} transaction={t} />
                    ))}
                </div>
            </div>

            {/* Activity Feed Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-500" />
                        Feed de Atividade do Casal
                    </h3>
                </div>
                <div className="p-2 space-y-1">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs">
                            Nenhuma atividade recente.
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                                <div className={clsx("mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800", activity.color)}>
                                    <activity.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                            {activity.user} {
                                                activity.type === 'transaction' ? (activity.transType === 'income' ? 'recebeu' : 'gastou com') :
                                                activity.type === 'bill' ? 'pagou a conta' :
                                                activity.type === 'goal' ? 'poupou para' :
                                                'marcou na lista:'
                                            } <span className="font-normal">{activity.title}</span>
                                        </p>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {activity.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        {activity.amount && (
                                            <p className={clsx("text-[10px] font-bold", activity.color)} data-value>
                                                {formatCurrency(activity.amount)}
                                            </p>
                                        )}
                                        <span className="text-[10px] text-slate-400 ml-auto">
                                            {activity.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
