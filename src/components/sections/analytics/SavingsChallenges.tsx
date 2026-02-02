import { Trophy, Target, AlertCircle, Plus, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { useChallenges } from '../../../hooks/useChallenges';
import { useTransactions } from '../../../hooks/useTransactions';
import { formatCurrency, parseLocaleNumber, sanitizeCurrencyInput } from '../../../lib/formatters';
import { useState, useMemo } from 'react';
import clsx from 'clsx';

export function SavingsChallenges() {
    const { challenges, loading: loadingChallenges, addChallenge, deleteChallenge } = useChallenges();
    const { transactions } = useTransactions();
    const [isAdding, setIsAdding] = useState(false);
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        target_amount: '',
        end_date: '',
        category: ''
    });

    const activeChallenges = useMemo(() => {
        return challenges.map(challenge => {
            // Calculate current amount based on transactions in the period and category
            const spent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    const cStart = new Date(challenge.start_date);
                    const cEnd = new Date(challenge.end_date);
                    const sameCategory = !challenge.category || t.category?.toLowerCase() === challenge.category.toLowerCase();
                    return t.type === 'expense' && tDate >= cStart && tDate <= cEnd && sameCategory;
                })
                .reduce((acc, t) => acc + Number(t.amount), 0);

            const isFailed = spent > challenge.target_amount;
            const isCompleted = new Date() > new Date(challenge.end_date) && !isFailed;
            
            return {
                ...challenge,
                current_amount: spent,
                status: isFailed ? 'failed' : isCompleted ? 'completed' : 'active'
            };
        });
    }, [challenges, transactions]);

    const handleAddChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await addChallenge({
            title: newChallenge.title,
            target_amount: parseLocaleNumber(newChallenge.target_amount),
            end_date: newChallenge.end_date,
            category: newChallenge.category || null,
            description: null
        });

        if (!error) {
            setIsAdding(false);
            setNewChallenge({ title: '', target_amount: '', end_date: '', category: '' });
        }
    };

    if (loadingChallenges) {
        return <div className="p-8 text-center animate-pulse text-slate-400">Carregando desafios...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Desafios de Economia
                    </h2>
                    <p className="text-sm text-slate-500">Transformem a economia em uma conquista!</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAddChallenge} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-violet-200 dark:border-violet-800 shadow-xl animate-in slide-in-from-top-4 duration-300 space-y-4">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">Novo Desafio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título do Desafio</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Semana sem iFood"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                value={newChallenge.title}
                                onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta de Gasto Máximo</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    required
                                    placeholder="0,00"
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                    value={newChallenge.target_amount}
                                    onChange={e => setNewChallenge({ ...newChallenge, target_amount: sanitizeCurrencyInput(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data Final</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                value={newChallenge.end_date}
                                onChange={e => setNewChallenge({ ...newChallenge, end_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Ex: Alimentação"
                                className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                value={newChallenge.category}
                                onChange={e => setNewChallenge({ ...newChallenge, category: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="flex-1 bg-violet-600 text-white font-bold py-3 rounded-xl hover:bg-violet-700 transition-all">Criar Desafio</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.length === 0 ? (
                    <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500">Nenhum desafio ativo. Que tal criar o primeiro?</p>
                    </div>
                ) : (
                    activeChallenges.map(challenge => {
                        const percentage = Math.min(100, (challenge.current_amount / challenge.target_amount) * 100);
                        const isFailed = challenge.status === 'failed';
                        const isCompleted = challenge.status === 'completed';

                        return (
                            <div key={challenge.id} className={clsx(
                                "relative p-5 rounded-2xl border transition-all overflow-hidden group",
                                isFailed ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30" :
                                isCompleted ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" :
                                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "p-2.5 rounded-xl",
                                            isFailed ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" :
                                            isCompleted ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                            "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                                        )}>
                                            {isFailed ? <AlertCircle className="w-5 h-5" /> :
                                             isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                                             <Target className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{challenge.title}</h4>
                                            <p className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                                                <Calendar className="w-3 h-3" />
                                                Até {new Date(challenge.end_date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteChallenge(challenge.id)} className="p-1.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-500">Progresso</span>
                                        <span className={isFailed ? "text-rose-600" : "text-slate-900 dark:text-slate-100"}>
                                            {formatCurrency(challenge.current_amount)} / {formatCurrency(challenge.target_amount)}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                        <div 
                                            className={clsx(
                                                "h-full transition-all duration-1000",
                                                isFailed ? "bg-rose-500" : percentage > 80 ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <p className={clsx(
                                        "text-[10px] font-bold text-center uppercase tracking-widest pt-1",
                                        isFailed ? "text-rose-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
                                    )}>
                                        {isFailed ? "Desafio Falhou!" : isCompleted ? "Desafio Concluído! 🎉" : `${Math.round(percentage)}% do limite usado`}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
