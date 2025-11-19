import React, { useState, useMemo } from 'react';
import { Campaign, SortOption, SortDirection } from '../types';
import { 
  formatCurrency, 
  formatPercent, 
  formatDate, 
  listarCampanhas, 
  excluirCampanha, 
  duplicarCampanha,
  maskDateInput,
  convertBrDateToISO
} from '../services/campaignService';
import { Search, Edit2, Trash2, Copy, Filter, ArrowUp, ArrowDown, Calendar } from 'lucide-react';

interface CampaignListProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onRefresh: () => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onEdit, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortOption; direction: SortDirection }>({ key: 'data_inicio', direction: 'desc' });
  
  // Filters store DD/MM/YYYY
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const handleSort = (key: SortOption) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta campanha?")) {
      excluirCampanha(id);
      onRefresh();
    }
  };

  const handleDuplicate = (id: string) => {
    const newCampaign = duplicarCampanha(id);
    if (newCampaign) {
      onRefresh();
    }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
      setter(maskDateInput(value));
  };

  // Client-side filtering/sorting for immediate feedback
  const filteredAndSortedCampaigns = useMemo(() => {
    // Convert filter strings to ISO for service if valid
    const startISO = filterDateStart.length === 10 ? convertBrDateToISO(filterDateStart) : undefined;
    const endISO = filterDateEnd.length === 10 ? convertBrDateToISO(filterDateEnd) : undefined;

    return listarCampanhas(
      sortConfig.key,
      sortConfig.direction,
      searchTerm,
      startISO || undefined,
      endISO || undefined
    );
  }, [campaigns, searchTerm, sortConfig, filterDateStart, filterDateEnd]);

  const SortIcon = ({ columnKey }: { columnKey: SortOption }) => {
    if (sortConfig.key !== columnKey) return <span className="w-4 h-4 ml-1 inline-block opacity-0"></span>;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 inline-block" /> : <ArrowDown size={14} className="ml-1 inline-block" />;
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar campanha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 whitespace-nowrap">
             <Calendar size={16} className="text-slate-500"/>
             <input 
                type="tel" 
                placeholder="Início"
                value={filterDateStart} 
                onChange={e => handleFilterChange(setFilterDateStart, e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none w-24 placeholder-slate-400"
                maxLength={10}
             />
             <span className="text-slate-400">-</span>
             <input 
                type="tel" 
                placeholder="Fim"
                value={filterDateEnd} 
                onChange={e => handleFilterChange(setFilterDateEnd, e.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none w-24 placeholder-slate-400"
                maxLength={10}
             />
          </div>
          {(filterDateStart || filterDateEnd) && (
            <button 
              onClick={() => { setFilterDateStart(''); setFilterDateEnd(''); }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Campanha</th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('data_inicio')}
                >
                  Início <SortIcon columnKey="data_inicio" />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('data_fim')}
                >
                  Fim <SortIcon columnKey="data_fim" />
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('lucro_real')}
                >
                  Lucro <SortIcon columnKey="lucro_real" />
                </th>
                <th 
                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-indigo-600"
                  onClick={() => handleSort('percentual_lucro')}
                >
                  Margem <SortIcon columnKey="percentual_lucro" />
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedCampaigns.length > 0 ? (
                filteredAndSortedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{campaign.campanha}</div>
                      {campaign.observacoes && <div className="text-xs text-slate-400 truncate max-w-[150px]">{campaign.observacoes}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(campaign.data_inicio)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{formatDate(campaign.data_fim)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={`text-sm font-bold ${campaign.lucro_real >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(campaign.lucro_real)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.percentual_lucro >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                       }`}>
                        {formatPercent(campaign.percentual_lucro)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => onEdit(campaign)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDuplicate(campaign.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition" 
                          title="Duplicar"
                        >
                          <Copy size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(campaign.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition" 
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Filter className="mx-auto h-12 w-12 text-slate-200 mb-3" />
                    <p>Nenhuma campanha encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignList;
