import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import type { User } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { formatCurrency, parseLocaleNumber, sanitizeCurrencyInput } from '../../lib/formatters';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}

export function TransactionModal({ isOpen, onClose, currentUser }: TransactionModalProps) {
    const { addTransaction } = useTransactions();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        amount: '',
        title: '',
        type: 'expense' as 'expense' | 'income',
        category: '',
        is_shared: false,
        classification: 'variable' as 'fixed' | 'variable',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setError(null);
            setSuccess(false);
            setFormData({
                amount: '',
                title: '',
                type: 'expense',
                category: '',
                is_shared: false,
                classification: 'variable',
                date: new Date().toISOString().split('T')[0],
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

        const { error } = await addTransaction({
            title: formData.title,
            amount: parseLocaleNumber(formData.amount),
            type: formData.type,
            category: formData.category || null,
            is_shared: formData.is_shared,
            classification: formData.type === 'expense' ? formData.classification : null,
            date: formData.date,
        });

        setLoading(false);

        if (error) {
            setError(error);
        } else {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
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
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Nova Transação</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="relative flex-1 overflow-y-auto">
                    {success && (
                        <div className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sucesso!</h4>
                            <p className="text-slate-500 dark:text-slate-400">Sua transação foi salva e já está no seu extrato.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6 space-y-4 pb-20 md:pb-6">
                        {error && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-600 dark:text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                            placeholder="Ex: Jantar, Mercado..."
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
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100 appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })}
                            >
                                <option value="expense">Despesa</option>
                                <option value="income">Receita</option>
                            </select>
                        </div>
                        {formData.type === 'expense' ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classificação</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100 appearance-none"
                                    value={formData.classification}
                                    onChange={e => setFormData({ ...formData, classification: e.target.value as 'fixed' | 'variable' })}
                                >
                                    <option value="fixed">Gasto Fixo</option>
                                    <option value="variable">Gasto Variável</option>
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                                    placeholder="Ex: Salário"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {formData.type === 'expense' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                                placeholder="Ex: Alimentação"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                        <input
                            type="date"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_shared"
                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                            checked={formData.is_shared}
                            onChange={e => setFormData({ ...formData, is_shared: e.target.checked })}
                        />
                        <label htmlFor="is_shared" className="text-sm text-slate-700 dark:text-slate-300">
                            Despesa compartilhada
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-transform active:scale-95 mt-4 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Salvando...' : 'Salvar Transação'}
                    </button>
                </form>
                </div>
            </div>
        </>
    );
}
