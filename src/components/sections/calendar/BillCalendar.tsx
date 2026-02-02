import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Clock, ReceiptText, Plus, Repeat, TrendingUp, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';
import { useBills } from '../../../hooks/useBills';
import { useTransactions } from '../../../hooks/useTransactions';
import { useShoppingItems } from '../../../hooks/useShoppingItems';
import { useState, useMemo } from 'react';
import { BillModal } from '../../ui/BillModal';
import { formatCurrency } from '../../../lib/formatters';

export function BillCalendar() {
    const { bills, loading: loadingBills, updateBill } = useBills();
    const { transactions, loading: loadingTransactions } = useTransactions();
    const { items: shoppingItems, loading: loadingShopping } = useShoppingItems();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);

    const loading = loadingBills || loadingTransactions || loadingShopping;

    const handleTogglePaid = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
        await updateBill(id, { status: newStatus as any });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    const currentMonth = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().getDate();
    const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year;

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Filter bills for current month
    const monthBills = bills.filter(bill => {
        const billDate = new Date(bill.due_date);
        return billDate.getMonth() === month && billDate.getFullYear() === year;
    });

    // Filter transactions (income and expenses) for current month
    const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
    });

    // Filter shopping items for current month
    const monthShopping = shoppingItems.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
    });

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500 text-emerald-50';
            case 'overdue': return 'bg-rose-500 text-rose-50';
            case 'pending': return 'bg-amber-400 text-amber-50';
            case 'expense': return 'bg-rose-500 text-rose-50';
            case 'income': return 'bg-emerald-500 text-emerald-50';
            case 'shopping': return 'bg-blue-500 text-blue-50';
            default: return 'bg-slate-200 dark:bg-slate-700';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calendário Financeiro</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsBillModalOpen(true)}
                        className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
                        title="Nova Conta"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={previousMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <ChevronLeft className="w-5 h-5 text-slate-500" />
                        </button>
                        <span className="text-sm font-semibold px-2 text-slate-700 dark:text-slate-300 min-w-[140px] text-center capitalize">
                            {currentMonth}
                        </span>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs overflow-x-auto pb-2 no-scrollbar">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-500">Ganhos / Pagos</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="text-slate-500">A Vencer</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="text-slate-500">Gastos / Atrasadas</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-slate-500">Total Compras</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase">
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sab</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {/* Empty slots for start of month offset */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}

                    {days.map(day => {
                        const dayBills = monthBills.filter(b => new Date(b.due_date).getDate() === day);
                        const dayTransactions = monthTransactions.filter(t => new Date(t.date).getDate() === day);
                        const dayShopping = monthShopping.filter(i => new Date(i.created_at).getDate() === day);
                        
                        const shoppingTotal = dayShopping.reduce((acc, curr) => acc + (Number(curr.estimated_price || 0) * curr.quantity), 0);
                        
                        const isToday = isCurrentMonth && day === today;
                        const hasContent = dayBills.length > 0 || dayTransactions.length > 0 || dayShopping.length > 0;
                        const isHovered = hoveredDay === day;

                        return (
                            <div
                                key={day}
                                onMouseEnter={() => setHoveredDay(day)}
                                onMouseLeave={() => setHoveredDay(null)}
                                onClick={() => setHoveredDay(hoveredDay === day ? null : day)}
                                className={clsx(
                                    "aspect-square rounded-xl flex flex-col items-center justify-start pt-2 relative border transition-all cursor-pointer",
                                    isToday ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20" : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700",
                                    isHovered && "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 z-20"
                                )}
                            >
                                <span className={clsx(
                                    "text-sm",
                                    isToday ? "font-bold text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-400"
                                )}>{day}</span>

                                <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5 flex-wrap">
                                    {dayBills.map(bill => (
                                        <div key={bill.id} className={clsx("w-1.5 h-1.5 rounded-full", getStatusColor(bill.status))}></div>
                                    ))}
                                    {dayTransactions.map(t => (
                                        <div key={t.id} className={clsx("w-1.5 h-1.5 rounded-full", getStatusColor(t.type))}></div>
                                    ))}
                                    {dayShopping.length > 0 && (
                                        <div className={clsx("w-1.5 h-1.5 rounded-full", getStatusColor('shopping'))}></div>
                                    )}
                                </div>

                                {/* Tooltip */}
                                {isHovered && hasContent && (
                                    <div className={clsx(
                                        "absolute bottom-full mb-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-30 animate-in fade-in zoom-in duration-200",
                                        "md:pointer-events-none", // Allow clicks on mobile, prevent flicker on desktop
                                        // Responsividade do Tooltip: Ajusta a posição horizontal para não cortar
                                        (day % 7 === 1 || day % 7 === 2) ? "left-0 translate-x-0" : // Começo da semana: alinha à esquerda
                                        (day % 7 === 0 || day % 7 === 6) ? "right-0 left-auto translate-x-0" : // Fim da semana: alinha à direita
                                        "left-1/2 -translate-x-1/2" // Meio da semana: centralizado
                                    )}>
                                        <div className="space-y-2">
                                            {dayBills.length > 0 && (
                                                <div className="space-y-1">
                                                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Contas</p>
                                                    {dayBills.map(bill => (
                                                        <div key={bill.id} className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <div className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", getStatusColor(bill.status))}></div>
                                                                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200 truncate">{bill.title}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100" data-value>{formatCurrency(bill.amount)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {dayTransactions.length > 0 && (
                                                <div className="pt-1 border-t border-slate-100 dark:border-slate-700 space-y-1">
                                                    <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Movimentações</p>
                                                    {dayTransactions.map(t => (
                                                        <div key={t.id} className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <div className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", getStatusColor(t.type))}></div>
                                                                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
                                                            </div>
                                                            <span className={clsx(
                                                                "text-[10px] font-bold",
                                                                t.type === 'income' ? "text-emerald-500" : "text-rose-500"
                                                            )} data-value>
                                                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {dayShopping.length > 0 && (
                                                <div className="pt-1 border-t border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[9px] uppercase font-bold text-blue-500">Lista de Compras</p>
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{formatCurrency(shoppingTotal)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Arrow */}
                                        <div className={clsx(
                                            "absolute top-full border-8 border-transparent border-t-white dark:border-t-slate-800",
                                            (day % 7 === 1 || day % 7 === 2) ? "left-4 translate-x-0" :
                                            (day % 7 === 0 || day % 7 === 6) ? "right-4 left-auto translate-x-0" :
                                            "left-1/2 -translate-x-1/2"
                                        )}></div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Combined List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Movimentações do Mês</h3>
                </div>

                {monthBills.length === 0 && monthExpenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p>Nenhuma movimentação para este mês</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Show Bills First */}
                        {monthBills.map(bill => {
                            const dueDate = new Date(bill.due_date);
                            const dayOfMonth = dueDate.getDate();
                            
                            return (
                                <div key={bill.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm group">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => handleTogglePaid(bill.id, bill.status)}
                                            className={clsx("p-3 rounded-xl flex items-center justify-center transition-all active:scale-90",
                                                bill.status === 'paid' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                    bill.status === 'overdue' ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" :
                                                        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                            )}
                                        >
                                            {bill.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> :
                                                bill.status === 'overdue' ? <AlertCircle className="w-5 h-5" /> :
                                                    <Clock className="w-5 h-5" />}
                                        </button>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{bill.title}</p>
                                                {bill.is_recurring && (
                                                    <Repeat className="w-3 h-3 text-slate-400" />
                                                )}
                                            </div>
                                            <p className={clsx("text-xs font-medium uppercase",
                                                bill.status === 'paid' ? "text-emerald-500" :
                                                    bill.status === 'overdue' ? "text-rose-500" : "text-amber-500"
                                            )}>
                                                {bill.status === 'paid' ? 'Conta Paga' :
                                                    bill.status === 'overdue' ? `Atrasada (Dia ${dayOfMonth})` :
                                                        `Vence dia ${dayOfMonth}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-semibold text-slate-900 dark:text-slate-100" data-value>
                                            R$ {Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        {bill.status !== 'paid' && (
                                            <button 
                                                onClick={() => handleTogglePaid(bill.id, bill.status)}
                                                className="text-[10px] font-bold text-violet-600 dark:text-violet-400 mt-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Marcar como Paga
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Show Expenses */}
                        {monthExpenses.map(t => {
                            const tDate = new Date(t.date);
                            const dayOfMonth = tDate.getDate();
                            
                            return (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 rounded-xl flex items-center justify-center">
                                            <ReceiptText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-slate-100">{t.title}</p>
                                            <p className="text-xs font-medium uppercase text-violet-500">
                                                Gasto realizado (Dia {dayOfMonth})
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-rose-600 dark:text-rose-400" data-value>
                                        - R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BillModal 
                isOpen={isBillModalOpen}
                onClose={() => setIsBillModalOpen(false)}
            />
        </div>
    );
}

