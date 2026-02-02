import { useState, useEffect } from 'react';
import type { TabId } from './types';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/layout/LoginScreen';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/sections/Dashboard';
import { TransactionsList } from './components/sections/TransactionsList';
import { GoalsList } from './components/sections/goals/GoalsList';
import { AnalyticsDashboard } from './components/sections/analytics/AnalyticsDashboard';
import { BillCalendar } from './components/sections/calendar/BillCalendar';
import { ShoppingList } from './components/sections/shopping/ShoppingList';
import { Settings } from './components/sections/settings/Settings';
import { TransactionModal } from './components/ui/TransactionModal';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Recarregar o app ao voltar para a aba
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('App visível, recarregando dados...');
        // Em vez de window.location.reload(), podemos disparar um evento global
        // Mas como o usuário pediu "recarregar", vamos seguir a risca ou ser mais inteligente
        // Vamos usar window.location.reload() para garantir sincronia total como solicitado
        window.location.reload();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Create user object for components that need it
  const appUser = {
    name: profile?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || user.email}`,
    role: 'Membro',
  };

  const handleLogout = async () => {
    await signOut();
    setActiveTab('dashboard');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans transition-colors duration-300">

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={appUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          user={appUser}
          onOpenModal={() => setIsModalOpen(true)}
          onLogout={handleLogout}
          onOpenSettings={() => setActiveTab('settings')}
        />

        {/* CONTENT SCROLL AREA */}
        <div id="content-scroll" className="flex-1 overflow-y-auto pt-6 md:pt-0 pb-24 md:pb-8 px-4 md:px-8 no-scrollbar scroll-smooth">
          {activeTab === 'dashboard' && (
            <Dashboard onSwitchTab={() => setActiveTab('transactions')} />
          )}
          {activeTab === 'transactions' && (
            <TransactionsList />
          )}
          {activeTab === 'goals' && (
            <GoalsList />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard />
          )}
          {activeTab === 'calendar' && (
            <BillCalendar />
          )}
          {activeTab === 'shopping' && (
            <ShoppingList />
          )}
          {activeTab === 'settings' && (
            <Settings />
          )}

          {/* Spacer for mobile nav content overlap prevention */}
          <div className="h-20 md:hidden"></div>
        </div>

        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenModal={() => setIsModalOpen(true)}
        />

        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentUser={appUser}
        />

      </main>
    </div>
  );
}

export default App;
