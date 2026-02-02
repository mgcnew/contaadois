import { LayoutGrid, ListFilter, PieChart, Target, LogOut, Wallet2, Calendar, ShoppingCart, Settings } from 'lucide-react';
import type { User, TabId } from '../../types';
import clsx from 'clsx';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    user: User;
    onLogout: () => void;
}

export function Sidebar({ activeTab, onTabChange, user, onLogout }: SidebarProps) {
    const navItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: LayoutGrid },
        { id: 'transactions', label: 'Extrato', icon: ListFilter },
        { id: 'analytics', label: 'Relatórios', icon: PieChart },
        { id: 'goals', label: 'Metas', icon: Target },
        { id: 'calendar', label: 'Calendário', icon: Calendar },
        { id: 'shopping', label: 'Compras', icon: ShoppingCart },
        { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-violet-600 p-2 rounded-lg">
                    <Wallet2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">Finanças</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const isClickable = true;

                    return (
                        <button
                            key={item.id}
                            onClick={() => isClickable && onTabChange(item.id as TabId)}
                            className={clsx(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                                isActive
                                    ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">Conta Conjunta</p>
                    </div>
                    <LogOut
                        className="text-slate-400 hover:text-red-500 cursor-pointer w-4 h-4 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onLogout(); }}
                    />
                </div>
            </div>
        </aside>
    );
}
