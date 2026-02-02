import { Bell, Moon, Sun, Plus, MoreVertical, LogOut, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import type { User } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useState } from 'react';

interface HeaderProps {
    user: User;
    onOpenModal: () => void;
    onLogout: () => void;
    onOpenSettings: () => void;
}

export function Header({ user, onOpenModal, onLogout, onOpenSettings }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [hideValues, setHideValues] = useState(false);

    // Global toggle for privacy mode
    const togglePrivacy = () => {
        const newValue = !hideValues;
        setHideValues(newValue);
        document.documentElement.classList.toggle('hide-values', newValue);
    };

    return (
        <>
            {/* Header (Mobile Only) */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full bg-slate-200 object-cover"
                    />
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Olá,</p>
                        <p className="text-sm font-bold leading-none text-slate-900 dark:text-slate-100">{user.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={togglePrivacy}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                        {hideValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                    
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in duration-200">
                                    <button 
                                        onClick={() => {
                                            onOpenSettings();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <SettingsIcon className="w-4 h-4" />
                                        Configurações
                                    </button>
                                    <button 
                                        onClick={() => {
                                            onLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sair
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Header (Desktop) */}
            <header className="hidden md:flex items-center justify-between px-8 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Visão geral das finanças do casal</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePrivacy}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        title={hideValues ? "Mostrar Valores" : "Esconder Valores"}
                    >
                        {hideValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>

                    <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={onOpenModal}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Transação
                    </button>
                </div>
            </header>
        </>
    );
}
