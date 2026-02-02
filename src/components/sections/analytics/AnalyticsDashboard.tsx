import { BarChart3, TrendingUp, PieChart, Info, Plus, Target, Trash2, Trophy } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import { useBudgets } from '../../../hooks/useBudgets';
import { useState, useMemo } from 'react';
import { formatCurrency, parseLocaleNumber, sanitizeCurrencyInput } from '../../../lib/formatters';
import { SavingsChallenges } from './SavingsChallenges';
import clsx from 'clsx';

type Period = 'monthly' | 'semester' | 'yearly';

export function AnalyticsDashboard() {
    const { transactions, loading: loadingTransactions } = useTransactions();
    const { budgets, saveBudget, deleteBudget, loading: loadingBudgets } = useBudgets();
    const [period, setPeriod] = useState<Period>('monthly');
    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
    const [activeTab, setActiveTab] = useState<'analytics' | 'challenges'>('analytics');

    const loading = loadingTransactions || loadingBudgets;

    const handleSaveBudget = async () => {
        if (!newBudget.category || !newBudget.amount) return;
        await saveBudget(newBudget.category, parseLocaleNumber(newBudget.amount));
        setNewBudget({ category: '', amount: '' });
        setIsAddingBudget(false);
    };

    // Calculate date range based on period
    const dateRange = useMemo(() => {
        const now = new Date();
        const start = new Date();
        
        if (period === 'monthly') {
            start.setMonth(now.getMonth() - 1);
        } else if (period === 'semester') {
            start.setMonth(now.getMonth() - 6);
        } else {
            start.setFullYear(now.getFullYear() - 1);
        }
        
        return { start, end: now };
    }, [period]);

    // Filter transactions by period
    const periodTransactions = useMemo(() => {
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= dateRange.start && transactionDate <= dateRange.end;
        });
    }, [transactions, dateRange]);

    // Calculate totals
    const totals = useMemo(() => {
        return periodTransactions.reduce(
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
    }, [periodTransactions]);

    const balance = totals.income - totals.expense;

    // Calculate category breakdown
    const categoryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        periodTransactions
            .filter(t => t.type === 'expense' && t.category)
            .forEach(t => {
                const category = t.category || 'Sem categoria';
                breakdown[category] = (breakdown[category] || 0) + Number(t.amount);
            });
        return Object.entries(breakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [periodTransactions]);

    // Calculate classification breakdown
    const classificationBreakdown = useMemo(() => {
        const breakdown = { fixed: 0, variable: 0 };
        periodTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const classification = t.classification || 'variable';
                breakdown[classification as 'fixed' | 'variable'] += Number(t.amount);
            });
        return breakdown;
    }, [periodTransactions]);

    const topCategory = categoryBreakdown[0];
    const topCategoryPercentage = topCategory 
        ? Math.round((topCategory[1] / (totals.expense || 1)) * 100) 
        : 0;

    // Calculate daily average
    const daysInPeriod = Math.max(1, Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverage = totals.expense / daysInPeriod;

    // Group transactions by month for chart
    const monthlyData = useMemo(() => {
        const months: Record<string, { income: number; expense: number }> = {};
        
        periodTransactions.forEach(t => {
            const date = new Date(t.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!months[monthKey]) {
                months[monthKey] = { income: 0, expense: 0 };
            }
            
            if (t.type === 'income') {
                months[monthKey].income += Number(t.amount);
            } else {
                months[monthKey].expense += Number(t.amount);
            }
        });
        
        return Object.entries(months)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6);
    }, [periodTransactions]);

    // Calculate max value for chart scaling
    const maxValue = Math.max(
        ...monthlyData.map(([_, data]) => Math.max(data.income, data.expense)),
        1
    );

    // Get month labels
    const getMonthLabel = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'short' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Relatórios & Desafios</h2>
                    <p className="text-sm text-slate-500">Análise e conquistas do casal.</p>
                </div>

                <div className="flex gap-2 text-sm bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'analytics'
                                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <PieChart className="w-4 h-4" />
                        Relatórios
                    </button>
                    <button 
                        onClick={() => setActiveTab('challenges')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'challenges'
                                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        Desafios
                    </button>
                </div>
            </div>

            {activeTab === 'challenges' ? (
                <SavingsChallenges />
            ) : (
                <>
                    <div className="flex justify-end">
                        <div className="flex gap-2 text-xs bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                            <button 
                                onClick={() => setPeriod('monthly')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    period === 'monthly'
                                        ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Mensal
                            </button>
                            <button 
                                onClick={() => setPeriod('semester')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    period === 'semester'
                                        ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Semestral
                            </button>
                            <button 
                                onClick={() => setPeriod('yearly')}
                                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    period === 'yearly'
                                        ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                Anual
                            </button>
                        </div>
                    </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Maior Gasto</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {topCategory ? topCategory[0] : 'N/A'}
                    </p>
                    <p className="text-xs text-rose-500 mt-1">
                        R$ {topCategory ? topCategory[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'} 
                        {topCategory && ` (${topCategoryPercentage}% do total)`}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Média Diária</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        R$ {dailyAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        Últimos {daysInPeriod} dias
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-lg text-violet-600 dark:text-violet-400">
                            <PieChart className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Saldo do Período</span>
                    </div>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        {balance >= 0 ? 'Economia' : 'Déficit'}
                    </p>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Comparativo Mensal</h3>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-500">Receitas</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            <span className="text-slate-500">Despesas</span>
                        </div>
                    </div>
                </div>

                {monthlyData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-slate-500">
                        <p>Nenhuma transação no período selecionado</p>
                    </div>
                ) : (
                    <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
                        {monthlyData.map(([monthKey, data]) => {
                            const incomeHeight = (data.income / maxValue) * 100;
                            const expenseHeight = (data.expense / maxValue) * 100;
                            
                            return (
                                <div key={monthKey} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative h-full flex items-end justify-center gap-1">
                                        {/* Income Bar */}
                                        <div className="relative w-full max-w-[20px] md:max-w-[30px]">
                                            <div
                                                className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-400"
                                                style={{ height: `${incomeHeight}%` }}
                                                title={`Receitas: R$ ${data.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            ></div>
                                        </div>
                                        {/* Expense Bar */}
                                        <div className="relative w-full max-w-[20px] md:max-w-[30px]">
                                            <div
                                                className="w-full bg-rose-500 rounded-t-lg transition-all duration-500 group-hover:bg-rose-400"
                                                style={{ height: `${expenseHeight}%` }}
                                                title={`Despesas: R$ ${data.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium capitalize">
                                        {getMonthLabel(monthKey)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Breakdown by Category & Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">Gastos por Categoria</h3>
                    </div>
                    
                    {categoryBreakdown.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                            <p>Nenhuma despesa categorizada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categoryBreakdown.map(([category, amount]) => {
                                const percentage = (amount / (totals.expense || 1)) * 100;
                                
                                return (
                                    <div key={category}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                {category}
                                            </span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                            <div 
                                                className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {percentage.toFixed(1)}% do total
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">Fixo vs. Variável</h3>
                    </div>
                    
                    {totals.expense === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                            <p>Nenhuma despesa no período</p>
                        </div>
                    ) : (
                        <div className="space-y-8 py-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Fixos (Essenciais)</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        R$ {classificationBreakdown.fixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                                    <div 
                                        className="bg-blue-500 h-full transition-all duration-500"
                                        style={{ width: `${(classificationBreakdown.fixed / (totals.expense || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {((classificationBreakdown.fixed / (totals.expense || 1)) * 100).toFixed(1)}% das despesas
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Variáveis (Estilo de Vida)</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        R$ {classificationBreakdown.variable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                                    <div 
                                        className="bg-orange-500 h-full transition-all duration-500"
                                        style={{ width: `${(classificationBreakdown.variable / (totals.expense || 1)) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {((classificationBreakdown.variable / (totals.expense || 1)) * 100).toFixed(1)}% das despesas
                                </p>
                            </div>

                            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-800">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5" />
                                    <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                                        {classificationBreakdown.fixed > totals.expense * 0.6 
                                            ? "Seus gastos fixos estão altos (acima de 60%). Tente renegociar contratos ou reduzir assinaturas."
                                            : "Seu equilíbrio entre fixos e variáveis está saudável. Continue monitorando seus gastos de estilo de vida."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Budgets Section */}
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                     <div>
                         <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Orçamentos Mensais</h3>
                         <p className="text-xs text-slate-500">Limites de gastos para cada categoria.</p>
                     </div>
                     <button 
                         onClick={() => setIsAddingBudget(true)}
                         className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                     >
                         <Plus className="w-4 h-4" />
                     </button>
                 </div>

                 {isAddingBudget && (
                        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder="Categoria (ex: Mercado)"
                                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                    value={newBudget.category}
                                    onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                                />
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="Valor Limite"
                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                        value={newBudget.amount}
                                        onChange={e => setNewBudget({ ...newBudget, amount: sanitizeCurrencyInput(e.target.value) })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSaveBudget}
                                        className="flex-1 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                                    >
                                        Salvar
                                    </button>
                                    <button 
                                        onClick={() => setIsAddingBudget(false)}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {budgets.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                            <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Nenhum orçamento definido.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map(budget => {
                                const spent = periodTransactions
                                    .filter(t => t.type === 'expense' && t.category?.toLowerCase() === budget.category.toLowerCase())
                                    .reduce((acc, t) => acc + Number(t.amount), 0);
                                
                                const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
                                const isOver = spent > budget.amount;

                                return (
                                    <div key={budget.id} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 capitalize">{budget.category}</h4>
                                                <p className="text-[10px] text-slate-500">
                                                    {formatCurrency(spent)} de {formatCurrency(budget.amount)}
                                                </p>
                                            </div>
                                            <button onClick={() => deleteBudget(budget.id)} className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={clsx(
                                                    "h-full rounded-full",
                                                    isOver ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                                                )}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
}
