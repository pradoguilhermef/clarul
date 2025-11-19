import React, { useState, useEffect } from 'react';
import { ViewState, Campaign, DashboardMetrics } from './types';
import { getDashboardMetrics, listarCampanhas } from './services/campaignservice';
import Dashboard from './components/Dashboard';
import CampaignForm from './components/CampaignForm';
import CampaignList from './components/CampaignList';
import { LayoutDashboard, PlusCircle, List, CheckCircle, Menu, Sun, Bird } from 'lucide-react';

// Custom Logo Component matching the company brand
const Logo = () => (
  <div className="relative flex items-center pt-2 pr-2 select-none group cursor-default">
    {/* Sun Icon */}
    <div className="absolute -top-3 left-3 animate-pulse">
       <Sun size={22} className="text-amber-400 fill-amber-400" />
    </div>
    
    {/* Text with specific brand colors */}
    <div className="flex items-baseline text-4xl font-bold tracking-wide relative z-10 drop-shadow-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>
      <span className="text-[#ea85a6]">C</span>
      <span className="text-[#9f85f6]">l</span>
      <span className="text-[#ea85a6]">a</span>
      <span className="text-[#85d68a]">R</span>
      <span className="text-[#5abbf3]">u</span>
      <span className="text-[#f6ac42]">l</span>
    </div>

    {/* Bird Icon */}
    <div className="absolute -top-2 -right-2 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300">
       <Bird size={20} className="text-[#5ec7c0] fill-[#5ec7c0]" />
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({ totalCampanhas: 0, lucroTotal: 0, ticketMedioVenda: 0, ticketMedioLucro: 0 });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data loading
  const loadData = () => {
    const allCampaigns = listarCampanhas();
    setCampaigns(allCampaigns);
    setMetrics(getDashboardMetrics());
  };

  useEffect(() => {
    loadData();
  }, []);

  // View Handlers
  const handleNavigate = (target: ViewState) => {
    setView(target);
    if (target !== 'form') {
      setEditingCampaign(null);
    }
    setIsMobileMenuOpen(false);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setView('form');
  };

  const handleSaveSuccess = () => {
    loadData();
    setView('list'); // Redirect to list to see the new item
    setToast("Campanha registrada com sucesso!");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-bounce-in">
          <CheckCircle size={20} className="mr-2" />
          {toast}
        </div>
      )}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen sticky top-0">
        <div className="p-6 pt-8 flex flex-col items-start">
          <Logo />
          <p className="text-xs text-slate-400 mt-2 ml-1 font-medium tracking-wider uppercase">Financeiro</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </button>
          <button
            onClick={() => handleNavigate('list')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              view === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <List size={20} className="mr-3" />
            Histórico
          </button>
          <button
            onClick={() => { setEditingCampaign(null); handleNavigate('form'); }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              view === 'form' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PlusCircle size={20} className="mr-3" />
            Nova Campanha
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">&copy; {new Date().getFullYear()} ClaRul</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
         <div className="pt-2 pl-2">
          <Logo />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-200 hover:text-white">
           <Menu size={28} />
         </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-30 pt-24 px-4 space-y-4">
           <button
            onClick={() => handleNavigate('dashboard')}
            className="w-full flex items-center px-4 py-4 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <LayoutDashboard size={20} className="mr-3" /> Dashboard
          </button>
          <button
            onClick={() => handleNavigate('list')}
            className="w-full flex items-center px-4 py-4 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <List size={20} className="mr-3" /> Histórico
          </button>
           <button
            onClick={() => { setEditingCampaign(null); handleNavigate('form'); }}
            className="w-full flex items-center px-4 py-4 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <PlusCircle size={20} className="mr-3" /> Nova Campanha
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {view === 'dashboard' && 'Visão Geral'}
              {view === 'list' && 'Histórico de Campanhas'}
              {view === 'form' && (editingCampaign ? 'Editar Campanha' : 'Nova Campanha')}
            </h2>
            <p className="text-slate-500 mt-1">
              {view === 'dashboard' && 'Acompanhe seus resultados financeiros'}
              {view === 'list' && 'Gerencie todas as suas campanhas de WhatsApp'}
              {view === 'form' && 'Preencha os dados para calcular os resultados'}
            </p>
          </div>
          {view === 'list' && (
            <button 
              onClick={() => { setEditingCampaign(null); handleNavigate('form'); }}
              className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center justify-center"
            >
              <PlusCircle size={18} className="mr-2" /> Criar Campanha
            </button>
          )}
        </header>

        <div className="w-full max-w-7xl mx-auto">
          {view === 'dashboard' && <Dashboard metrics={metrics} campaigns={campaigns} />}
          
          {view === 'list' && (
            <CampaignList 
              campaigns={campaigns} 
              onEdit={handleEdit} 
              onRefresh={loadData} 
            />
          )}

          {view === 'form' && (
            <CampaignForm 
              existingCampaign={editingCampaign} 
              onSuccess={handleSaveSuccess} 
              onCancel={() => handleNavigate('list')} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
