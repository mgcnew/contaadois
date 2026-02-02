import { X, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useBills } from '../../hooks/useBills';
import { formatCurrency, parseLocaleNumber, sanitizeCurrencyInput } from '../../lib/formatters';

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BillModal({ isOpen, onClose }: BillModalProps) {
    const { addBill } = useBills();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        due_date: new Date().toISOString().split('T')[0],
        category: '',
        is_recurring: false,
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setError(null);
            setFormData({
                title: '',
                amount: '',
                due_date: new Date().toISOString().split('T')[0],
                category: '',
                is_recurring: false,
            });
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await addBill({
            title: formData.title,
            amount: parseLocaleNumber(formData.amount),
            due_date: formData.due_date,
            status: 'pending',
            category: formData.category || null,
            is_recurring: formData.is_recurring,
        });

        setLoading(false);

        if (error) {
            setError(error);
        } else {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={clsx(
                    "fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 w-full md:w-[480px] md:max-w-[90vw] bg-white dark:bg-slate-900 md:rounded-2xl rounded-t-2xl shadow-2xl z-50 transition-all duration-300 flex flex-col max-h-[90vh] md:max-h-[85vh]",
                    isOpen 
                        ? "translate-y-0 md:translate-y-[-50%] md:translate-x-[-50%]" 
                        : "translate-y-full md:translate-y-[-40%] md:translate-x-[-50%] md:opacity-0"
                )}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Nova Conta</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto pb-20 md:pb-6">
                    {error && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-600 dark:text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título da Conta</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                            placeholder="Ex: Aluguel, Internet, Netflix..."
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">R$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100 font-bold text-lg"
                                placeholder="0,00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: sanitizeCurrencyInput(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vencimento</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                                value={formData.due_date}
                                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                                placeholder="Ex: Moradia"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-violet-50 dark:bg-violet-900/10 rounded-xl border border-violet-100 dark:border-violet-900/30">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                            <Repeat className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Conta Recorrente</p>
                            <p className="text-xs text-slate-500">Repetir automaticamente todos os meses.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            checked={formData.is_recurring}
                            onChange={e => setFormData({ ...formData, is_recurring: e.target.checked })}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-transform active:scale-95 mt-4 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <CalendarIcon className="w-5 h-5" />
                                Salvar no Calendário
                            </>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}
