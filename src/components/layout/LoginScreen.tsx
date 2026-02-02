import { useState } from 'react';
import { Wallet2, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function LoginScreen() {
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (isSignUp) {
            const { error } = await signUp(email, password, name);
            if (error) {
                setError(error.message);
            } else {
                setSuccess('Conta criada! Verifique seu email para confirmar.');
            }
        } else {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            }
        }
        setLoading(false);
    };

    return (
        <section className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 animate-fade-in">
            <div className="text-center mb-8">
                <div className="bg-violet-600 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Wallet2 className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900 dark:text-slate-100">
                    Finanças a Dois
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Gerencie o futuro financeiro juntos.
                </p>
            </div>

            <div className="w-full max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                                required={isSignUp}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSignUp ? (
                            'Criar Conta'
                        ) : (
                            'Entrar'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                            setSuccess(null);
                        }}
                        className="text-sm text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                        {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
                    </button>
                </div>
            </div>
        </section>
    );
}
