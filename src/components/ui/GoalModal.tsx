import { X, Target, Trophy, Plane, Car, Heart, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useGoals } from '../../hooks/useGoals';
import { parseLocaleNumber, sanitizeCurrencyInput } from '../../lib/formatters';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const icons = [
    { id: 'target', icon: Target, label: 'Geral' },
    { id: 'trophy', icon: Trophy, label: 'Conquista' },
    { id: 'plane', icon: Plane, label: 'Viagem' },
    { id: 'car', icon: Car, label: 'Veículo' },
    { id: 'home', icon: Home, label: 'Casa' },
    { id: 'heart', icon: Heart, label: 'Sonho' },
];

export function GoalModal({ isOpen, onClose }: GoalModalProps) {
    const { addGoal } = useGoals();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        target_amount: '',
        current_amount: '',
        icon: 'target',
        deadline: '',
    });

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setError(null);
            setFormData({
                title: '',
                target_amount: '',
                current_amount: '0',
                icon: 'target',
                deadline: '',
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

        const { error } = await addGoal({
            title: formData.title,
            target_amount: parseLocaleNumber(formData.target_amount),
            current_amount: parseLocaleNumber(formData.current_amount || '0'),
            icon: formData.icon,
            deadline: formData.deadline || null,
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
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Nova Meta</h3>
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">O que vocês querem conquistar?</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                            placeholder="Ex: Viagem para Paris, Casa Própria..."
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quanto custa?</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100 font-bold"
                                    placeholder="0,00"
                                    value={formData.target_amount}
                                    onChange={e => setFormData({ ...formData, target_amount: sanitizeCurrencyInput(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Já temos quanto?</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100 font-bold"
                                    placeholder="0,00"
                                    value={formData.current_amount}
                                    onChange={e => setFormData({ ...formData, current_amount: sanitizeCurrencyInput(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Escolha um ícone</label>
                        <div className="grid grid-cols-6 gap-2">
                            {icons.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: item.id })}
                                    className={clsx(
                                        "p-3 rounded-xl border-2 transition-all flex items-center justify-center",
                                        formData.icon === item.id 
                                            ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20" 
                                            : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo (opcional)</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-900 dark:text-slate-100"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-transform active:scale-95 mt-4 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Salvando...' : 'Salvar Meta'}
                    </button>
                </form>
            </div>
        </>
    );
}
