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
            <div className="bg-violet-600 dark:bg-violet-700 rounded-2xl p-6 text-white shadow-sm transition-all">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Lista de Compras</h2>
                        <p className="opacity-90">Total Estimado: {formatCurrency(totalEstimated)}</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                        <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                </div>

                <form onSubmit={handleAddItem} className="mt-6 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="O que vamos comprar?"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all font-medium"
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
                            className={clsx(
                                "p-3 rounded-xl border border-white/20 transition-all flex-shrink-0",
                                showAdvancedAdd ? "bg-white text-violet-600" : "bg-white/10 text-white"
                            )}
                        >
                            <Plus className={clsx("w-5 h-5 transition-transform", showAdvancedAdd && "rotate-45")} />
                        </button>
                        {!showAdvancedAdd && (
                            <button type="submit" className="px-4 md:px-6 bg-white text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors flex-shrink-0">
                                Add
                            </button>
                        )}
                    </div>

                    {showAdvancedAdd && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="bg-white/10 rounded-xl p-1 flex items-center justify-between border border-white/20">
                                <button 
                                    type="button" 
                                    onClick={() => setNewItemQty(Math.max(1, newItemQty - 1))}
                                    className="p-3 sm:p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <Minus className="w-5 h-5 sm:w-4 sm:h-4" />
                                </button>
                                <span className="font-bold text-lg sm:text-base">{newItemQty} un</span>
                                <button 
                                    type="button" 
                                    onClick={() => setNewItemQty(newItemQty + 1)}
                                    className="p-3 sm:p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-white/60">R$</div>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-all font-bold text-lg sm:text-base"
                                    value={newItemPrice}
                                    onChange={e => setNewItemPrice(sanitizeCurrencyInput(e.target.value))}
                                />
                            </div>
                            <button type="submit" className="sm:col-span-2 py-4 sm:py-3 bg-white text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors text-lg sm:text-base">
                                Adicionar à Lista
                            </button>
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
                                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-1 py-0.5 sm:py-0">
                                                        <button 
                                                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                                                            className="p-1.5 sm:p-1 text-slate-500 hover:text-violet-600"
                                                        >
                                                            <Minus className="w-4 h-4 sm:w-3 sm:h-3" />
                                                        </button>
                                                        <span className="text-xs sm:text-[10px] font-bold px-1.5 sm:px-1 text-slate-700 dark:text-slate-300">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                                                            className="p-1.5 sm:p-1 text-slate-500 hover:text-violet-600"
                                                        >
                                                            <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
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


