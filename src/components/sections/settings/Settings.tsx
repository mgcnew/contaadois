import { User as UserIcon, Bell, Shield, Wallet, LogOut, ChevronRight, Camera, Check, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useState, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export function Settings() {
    const { profile, updateProfile, uploadAvatar, signOut } = useAuth();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [name, setName] = useState(profile?.name || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSaveProfile = async () => {
        setLoading(true);
        const { error } = await updateProfile({ name });
        setLoading(false);
        if (!error) {
            setIsEditingProfile(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const { publicUrl, error } = await uploadAvatar(file);
        
        if (publicUrl && !error) {
            await updateProfile({ avatar_url: publicUrl });
        }
        setUploading(false);
    };

    const sections = [
        {
            title: 'Conta',
            items: [
                { 
                    icon: UserIcon, 
                    label: 'Meu Perfil', 
                    desc: 'Alterar foto, nome',
                    onClick: () => setIsEditingProfile(true)
                },
                { icon: Shield, label: 'Segurança & Privacidade', desc: 'Senha, FaceID' },
            ]
        },
        {
            title: 'Preferências',
            items: [
                { icon: Bell, label: 'Notificações', desc: 'Alertas de contas, metas', toggle: true },
                { icon: Wallet, label: 'Categorias & Orçamentos', desc: 'Editar categorias personalizadas' },
            ]
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Configurações</h2>

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md overflow-hidden flex items-center justify-center">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-12 h-12 text-slate-300" />
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleAvatarClick}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-colors disabled:bg-slate-400"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="text-center w-full max-w-xs">
                        {isEditingProfile ? (
                            <div className="flex flex-col gap-3 animate-in fade-in zoom-in duration-200">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-center font-bold text-slate-900 dark:text-slate-100"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setName(profile?.name || '');
                                        }}
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{profile?.name}</h3>
                                <p className="text-sm text-slate-500">{profile?.couple_id ? 'Perfil Vinculado' : 'Perfil Individual'}</p>
                                <button 
                                    onClick={() => setIsEditingProfile(true)}
                                    className="mt-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                                >
                                    Editar Nome
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">{section.title}</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {section.items.map((item, i) => (
                                <div key={i} 
                                    onClick={item.onClick}
                                    className={clsx(
                                    "p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group",
                                    i !== section.items.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 group-hover:text-violet-600 transition-colors">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                                            <p className="text-xs text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.toggle && (
                                            <div className="w-11 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        )}
                                        {!item.toggle && <ChevronRight className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => signOut()}
                    className="w-full p-4 flex items-center justify-center gap-2 text-rose-500 font-medium hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sair da Conta
                </button>

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-slate-400">Versão 2.1.0 (Build 4502)</p>
                    <p className="text-xs text-slate-500 mt-1">Feito com ❤️ por Finanças a Dois</p>
                </div>
            </div>
        </div>
    );
}
