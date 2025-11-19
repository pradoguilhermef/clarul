export interface Campaign {
  id: string;
  campanha: string;
  data_inicio: string;
  data_fim: string;
  quantidade_clientes: number;
  valor_venda: number;
  valor_compra: number;
  lucro_real: number;
  percentual_lucro: number;
  observacoes?: string;
}

export type SortOption = 'data_inicio' | 'data_fim' | 'lucro_real' | 'percentual_lucro';
export type SortDirection = 'asc' | 'desc';

export interface DashboardMetrics {
  totalCampanhas: number;
  lucroTotal: number;
  ticketMedioVenda: number;
  ticketMedioLucro: number;
}

export type ViewState = 'dashboard' | 'list' | 'form';