import { Target, Trophy, Plane, Car, Heart, Home } from 'lucide-react';
import { useState } from 'react';
import { useGoals } from '../../../hooks/useGoals';
import { GoalModal } from '../../ui/GoalModal';

const iconMap: Record<string, any> = {
    plane: Plane,
    trophy: Trophy,
    car: Car,
    heart: Heart,
    home: Home,
    target: Target,
};

export function GoalsList() {
    const { goals, loading } = useGoals();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Metas do Casal</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Target className="w-4 h-4" /> Nova Meta
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.length === 0 ? (
                    <div className="col-span-2 p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p>Nenhuma meta cadastrada ainda</p>
                    </div>
                ) : (
                    goals.map((goal) => {
                        const percentage = Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100));
                        const IconComponent = iconMap[goal.icon] || Target;
                        const deadlineFormatted = goal.deadline 
                            ? new Date(goal.deadline).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                            : 'Sem prazo';

                        return (
                            <div key={goal.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-violet-200 dark:hover:border-violet-900 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-violet-600 dark:text-violet-400">
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
                                        {deadlineFormatted}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{goal.title}</h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    R$ {goal.current_amount.toLocaleString('pt-BR')} de R$ {goal.target_amount.toLocaleString('pt-BR')}
                                </p>

                                {/* Progress Bar - Flat */}
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-violet-600 h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-medium">
                                    <span className="text-violet-600 dark:text-violet-400">{percentage}% completo</span>
                                    <span className="text-slate-400">Faltam R$ {(goal.target_amount - goal.current_amount).toLocaleString('pt-BR')}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <GoalModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

