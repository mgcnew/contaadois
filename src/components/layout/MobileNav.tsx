import { LayoutGrid, ListFilter, PieChart, Plus, Layers, Calendar, ShoppingCart } from 'lucide-react';
import type { TabId } from '../../types';
import clsx from 'clsx';
import { useState } from 'react';

interface MobileNavProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    onOpenModal: () => void;
}

const extraTabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'goals', label: 'Metas', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'shopping', label: 'Compras', icon: ShoppingCart },
];

export function MobileNav({ activeTab, onTabChange, onOpenModal }: MobileNavProps) {
    const [isExtrasOpen, setIsExtrasOpen] = useState(false);

    const handleTabClick = (tab: TabId) => {
        onTabChange(tab);
        setIsExtrasOpen(false);
    };

    return (
        <>
            {isExtrasOpen && (
                <div className="md:hidden fixed inset-0 z-40 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="fixed inset-0" 
                        onClick={() => setIsExtrasOpen(false)}
                    />
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">Extras</h3>
                            <button 
                                onClick={() => setIsExtrasOpen(false)}
                                className="text-sm text-slate-500 font-medium"
                            >
                                Fechar
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handleTabClick('goals')}
                                className={clsx(
                                    "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
                                    activeTab === 'goals' ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <LayoutGrid className="mb-2 w-6 h-6" />
                                <span className="text-[10px] font-bold">Metas</span>
                            </button>
                            <button
                                onClick={() => handleTabClick('calendar')}
                                className={clsx(
                                    "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
                                    activeTab === 'calendar' ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <Calendar className="mb-2 w-6 h-6" />
                                <span className="text-[10px] font-bold">Agenda</span>
                            </button>
                            <button
                                onClick={() => handleTabClick('shopping')}
                                className={clsx(
                                    "flex flex-col items-center justify-center p-4 rounded-xl transition-all",
                                    activeTab === 'shopping' ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <ShoppingCart className="mb-2 w-6 h-6" />
                                <span className="text-[10px] font-bold">Compras</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-30">
                <div className="flex justify-around items-center h-16 px-2 relative">
                    <button
                        onClick={() => onTabChange('dashboard')}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 h-full transition-colors active:scale-95",
                            activeTab === 'dashboard' ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                        )}
                    >
                        <LayoutGrid className="mb-1 w-6 h-6" />
                        <span className="text-[10px] font-medium">Início</span>
                    </button>

                    <button
                        onClick={() => onTabChange('transactions')}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 h-full transition-colors active:scale-95",
                            activeTab === 'transactions' ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                        )}
                    >
                        <ListFilter className="mb-1 w-6 h-6" />
                        <span className="text-[10px] font-medium">Extrato</span>
                    </button>

                    {/* FAB in Center */}
                    <div className="relative -top-5">
                        <button
                            onClick={onOpenModal}
                            className="w-12 h-12 bg-violet-600 dark:bg-violet-600 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    <button
                        onClick={() => onTabChange('analytics')}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 h-full transition-colors active:scale-95",
                            activeTab === 'analytics' ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                        )}
                    >
                        <PieChart className="mb-1 w-6 h-6" />
                        <span className="text-[10px] font-medium">Relatórios</span>
                    </button>

                    <button
                        onClick={() => setIsExtrasOpen(true)}
                        className={clsx(
                            "flex flex-col items-center justify-center w-16 h-full transition-colors active:scale-95",
                            ['goals', 'calendar', 'shopping'].includes(activeTab) ? "text-violet-600 dark:text-violet-400" : "text-slate-400"
                        )}
                    >
                        <Layers className="mb-1 w-6 h-6" />
                        <span className="text-[10px] font-medium">Extra</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
