import { Campaign, DashboardMetrics, SortOption, SortDirection } from '../types';

const STORAGE_KEY = 'clarul_campaigns';

// Helper to simulate "Google AI Studio Internal DB" persistence via LocalStorage
const getStoredCampaigns = (): Campaign[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveStoredCampaigns = (campaigns: Campaign[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
};

export const calcularLucros = (valorVenda: number, valorCompra: number) => {
  const lucro_real = valorVenda - valorCompra;
  let percentual_lucro = 0;
  if (valorCompra > 0) {
    percentual_lucro = (lucro_real / valorCompra) * 100;
  }
  return { lucro_real, percentual_lucro };
};

export const salvarCampanha = (campaignData: Omit<Campaign, 'id' | 'lucro_real' | 'percentual_lucro'> & { id?: string }): Campaign => {
  const campaigns = getStoredCampaigns();
  const { lucro_real, percentual_lucro } = calcularLucros(campaignData.valor_venda, campaignData.valor_compra);
  
  const newCampaign: Campaign = {
    ...campaignData,
    id: campaignData.id || crypto.randomUUID(),
    lucro_real,
    percentual_lucro
  };

  if (campaignData.id) {
    // Update existing
    const index = campaigns.findIndex(c => c.id === campaignData.id);
    if (index !== -1) {
      campaigns[index] = newCampaign;
    }
  } else {
    // Create new
    campaigns.push(newCampaign);
  }

  saveStoredCampaigns(campaigns);
  return newCampaign;
};

export const excluirCampanha = (id: string): void => {
  const campaigns = getStoredCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  saveStoredCampaigns(filtered);
};

export const duplicarCampanha = (id: string): Campaign | null => {
  const campaigns = getStoredCampaigns();
  const original = campaigns.find(c => c.id === id);
  
  if (!original) return null;

  const copy: Campaign = {
    ...original,
    id: crypto.randomUUID(),
    campanha: `${original.campanha} (Cópia)`,
    // Recalculate just in case logic changes, though values are static
    ...calcularLucros(original.valor_venda, original.valor_compra)
  };

  campaigns.push(copy);
  saveStoredCampaigns(campaigns);
  return copy;
};

export const listarCampanhas = (
  sortBy: SortOption = 'data_inicio', 
  direction: SortDirection = 'desc',
  searchTerm: string = '',
  startDateISO?: string,
  endDateISO?: string
): Campaign[] => {
  let campaigns = getStoredCampaigns();

  // Filter by Date Range (Expects ISO YYYY-MM-DD)
  if (startDateISO) {
    campaigns = campaigns.filter(c => c.data_inicio >= startDateISO);
  }
  if (endDateISO) {
    campaigns = campaigns.filter(c => c.data_fim <= endDateISO);
  }

  // Search
  if (searchTerm) {
    const lowerTerm = searchTerm.toLowerCase();
    campaigns = campaigns.filter(c => c.campanha.toLowerCase().includes(lowerTerm));
  }

  // Sort
  campaigns.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return campaigns;
};

export const getDashboardMetrics = (): DashboardMetrics => {
  const campaigns = getStoredCampaigns();
  const totalCampanhas = campaigns.length;
  
  if (totalCampanhas === 0) {
    return { totalCampanhas: 0, lucroTotal: 0, ticketMedioVenda: 0, ticketMedioLucro: 0 };
  }

  const lucroTotal = campaigns.reduce((sum, c) => sum + c.lucro_real, 0);
  const totalVendas = campaigns.reduce((sum, c) => sum + c.valor_venda, 0);
  const totalClientes = campaigns.reduce((sum, c) => sum + (c.quantidade_clientes || 0), 0);

  return {
    totalCampanhas,
    lucroTotal,
    // Calculates per customer (comprador) instead of per campaign
    ticketMedioVenda: totalClientes > 0 ? totalVendas / totalClientes : 0,
    ticketMedioLucro: totalClientes > 0 ? lucroTotal / totalClientes : 0
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);
};

// Display: YYYY-MM-DD -> DD/MM/YYYY
export const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

// Input Mask: User Types -> DD/MM/YYYY
export const maskDateInput = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove non-digits
    .replace(/(\d{2})(\d)/, '$1/$2') // Add slash after 2nd char
    .replace(/(\d{2})(\d)/, '$1/$2') // Add slash after 4th char
    .replace(/(\d{4})\d+?$/, '$1'); // Limit length
};

// Convert: DD/MM/YYYY -> YYYY-MM-DD (for storage)
export const convertBrDateToISO = (brDate: string): string | null => {
  if (brDate.length !== 10) return null;
  const [day, month, year] = brDate.split('/');
  if (!day || !month || !year) return null;
  
  // Basic validation
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;

  return `${year}-${month}-${day}`;
};

// Convert: YYYY-MM-DD -> DD/MM/YYYY (for form editing)
export const convertIsoToBrDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};