import { Plus, Trash2, Check, ShoppingCart, Minus, DollarSign } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useShoppingItems } from '../../../hooks/useShoppingItems';
import { formatCurrency, parseLocaleNumber, sanitizeCurrencyInput } from '../../../lib/formatters';

export function ShoppingList() {
    const { items, loading, toggleCheck, deleteItem: removeItem, addItem: createItem, updateItem } = useShoppingItems();
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState('');
    const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        await createItem({
            name: newItemName,
            quantity: newItemQty,
            estimated_price: newItemPrice ? parseLocaleNumber(newItemPrice) : 0,
            is_checked: false,
        });
        
        setNewItemName('');
        setNewItemQty(1);
        setNewItemPrice('');
        setShowAdvancedAdd(false);
    };

    const handleUpdateQty = async (id: string, currentQty: number, delta: number) => {
        const newQty = Math.max(1, currentQty + delta);
        if (newQty !== currentQty) {
            await updateItem(id, { quantity: newQty });
        }
    };

    const totalEstimated = items.reduce((acc, curr) => !curr.is_checked ? acc + (Number(curr.estimated_price || 0) * curr.quantity) : acc, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <div className="bg-violet-600 dark:bg-violet-700 rounded-2xl p-4 sm:p-6 text-white shadow-sm transition-all">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold truncate">Lista de Compras</h2>
                        <p className="text-sm sm:text-base opacity-90">Total Estimado: {formatCurrency(totalEstimated)}</p>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl flex-shrink-0">
                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                </div>

                <form onSubmit={handleAddItem} className="mt-4 sm:mt-6 space-y-3">
                    <div className="flex flex-col gap-3">
                        {/* Linha 1: Input de texto (Sempre largura total) */}
                        <input
                            type="text"
                            placeholder="O que vamos comprar?"
                            className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all font-medium text-lg sm:text-base"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                        />
                        
                        {/* Linha 2: Botões (Lado a lado no mobile, integrados no desktop) */}
                        <div className="flex items-center gap-2">
                            {!showAdvancedAdd && (
                                <button 
                                    type="submit" 
                                    disabled={!newItemName.trim()}
                                    className="flex-1 sm:flex-none sm:px-8 py-3.5 bg-white text-violet-600 rounded-2xl font-bold hover:bg-violet-50 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:scale-100 text-base"
                                >
                                    Adicionar
                                </button>
                            )}
                            
                            <button 
                                type="button" 
                                onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
                                className={clsx(
                                    "p-3.5 rounded-2xl border border-white/20 transition-all flex items-center justify-center min-w-[54px] h-[54px]",
                                    showAdvancedAdd ? "flex-1 sm:flex-none bg-white text-violet-600 shadow-lg" : "bg-white/10 text-white",
                                    !showAdvancedAdd && "sm:ml-auto"
                                )}
                            >
                                <Plus className={clsx("w-6 h-6 transition-transform duration-300", showAdvancedAdd && "rotate-45")} />
                                {showAdvancedAdd && <span className="ml-2 font-bold sm:hidden">Fechar Opções</span>}
                            </button>
                        </div>
                    </div>

                    {showAdvancedAdd && (
                        <div className="bg-white/5 rounded-2xl p-3 sm:p-5 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-white/60 ml-1">Quantidade</label>
                                    <div className="bg-white/10 rounded-2xl p-1 flex items-center justify-between border border-white/20 h-[54px]">
                                        <button 
                                            type="button" 
                                            onClick={() => setNewItemQty(Math.max(1, newItemQty - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-xl transition-colors"
                                        >
                                            <Minus className="w-6 h-6" />
                                        </button>
                                        <span className="font-bold text-xl">{newItemQty} <span className="text-sm font-normal opacity-60">un</span></span>
                                        <button 
                                            type="button" 
                                            onClick={() => setNewItemQty(newItemQty + 1)}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-white/10 active:bg-white/20 rounded-xl transition-colors"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-white/60 ml-1">Preço Estimado (un)</label>
                                    <div className="relative h-[54px]">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-white/60">R$</div>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0,00"
                                            className="w-full h-full pl-11 pr-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/30 transition-all font-bold text-xl"
                                            value={newItemPrice}
                                            onChange={e => setNewItemPrice(sanitizeCurrencyInput(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowAdvancedAdd(false)}
                                    className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={!newItemName.trim()}
                                    className="flex-[2] py-4 bg-white text-violet-600 rounded-2xl font-bold hover:bg-violet-50 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:scale-100"
                                >
                                    Confirmar e Adicionar
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium">Sua lista está vazia!</p>
                        <p className="text-sm text-slate-400">Adicione itens que vocês precisam comprar.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {items.map(item => (
                            <div key={item.id} className={clsx(
                                "group p-4 flex items-center justify-between gap-3 transition-all",
                                item.is_checked ? "bg-slate-50/50 dark:bg-slate-900/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            )}>
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <button
                                        onClick={() => toggleCheck(item.id, !item.is_checked)}
                                        className={clsx(
                                            "w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                            item.is_checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 hover:border-violet-500"
                                        )}
                                    >
                                        {item.is_checked && <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />}
                                    </button>

                                    <div className="min-w-0 flex-1">
                                        <p className={clsx(
                                            "font-semibold truncate transition-all text-base sm:text-base",
                                            item.is_checked ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"
                                        )}>{item.name}</p>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                                            <div className="flex items-center gap-1">
                                                {!item.is_checked && (
                                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-1 py-1 sm:py-0.5">
                                                        <button 
                                                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                                                            className="p-2 sm:p-1.5 text-slate-500 hover:text-violet-600 active:scale-90 transition-transform"
                                                        >
                                                            <Minus className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                                                        </button>
                                                        <span className="text-sm sm:text-xs font-bold px-2 sm:px-1.5 text-slate-700 dark:text-slate-300">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                                                            className="p-2 sm:p-1.5 text-slate-500 hover:text-violet-600 active:scale-90 transition-transform"
                                                        >
                                                            <Plus className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                {item.is_checked && <span className="text-xs sm:text-[10px] font-bold text-slate-400">{item.quantity} un</span>}
                                            </div>
                                            {item.estimated_price && Number(item.estimated_price) > 0 && (
                                                <span className={clsx(
                                                    "text-xs sm:text-[10px] font-medium whitespace-nowrap",
                                                    item.is_checked ? "text-slate-300" : "text-slate-500"
                                                )}>
                                                    {formatCurrency(Number(item.estimated_price))}/un
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                    {!item.is_checked && item.estimated_price && Number(item.estimated_price) > 0 && (
                                        <span className="text-sm sm:text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                            {formatCurrency(Number(item.estimated_price) * item.quantity)}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2.5 sm:p-2 text-slate-400 sm:text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl sm:rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


