import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { Campaign, DashboardMetrics } from '../types';
import { formatCurrency } from '../services/campaignService';

interface DashboardProps {
  metrics: DashboardMetrics;
  campaigns: Campaign[];
}

const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 transition hover:shadow-md">
    <div className={`p-4 rounded-full ${colorClass} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ metrics, campaigns }) => {
  // Prepare data for charts
  // Sort by date asc for timeline
  const chartData = [...campaigns].sort((a, b) => a.data_inicio.localeCompare(b.data_inicio)).map(c => ({
    name: c.campanha,
    Lucro: c.lucro_real,
    Venda: c.valor_venda,
    Compra: c.valor_compra
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total de Campanhas" 
          value={metrics.totalCampanhas.toString()} 
          icon={<Users size={24} />}
          colorClass="bg-blue-500"
        />
        <MetricCard 
          title="Lucro Total" 
          value={formatCurrency(metrics.lucroTotal)} 
          icon={<TrendingUp size={24} />}
          colorClass={metrics.lucroTotal >= 0 ? "bg-emerald-500" : "bg-red-500"}
        />
        <MetricCard 
          title="Ticket Médio (Venda)" 
          value={formatCurrency(metrics.ticketMedioVenda)} 
          icon={<DollarSign size={24} />}
          colorClass="bg-purple-500"
        />
        <MetricCard 
          title="Ticket Médio (Lucro)" 
          value={formatCurrency(metrics.ticketMedioLucro)} 
          icon={<Activity size={24} />}
          colorClass="bg-indigo-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profit Evolution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução do Lucro</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} tickLine={false} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} tickLine={false} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line type="monotone" dataKey="Lucro" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost vs Sales Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Comparativo: Compra x Venda</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} tickLine={false} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} tickLine={false} tickFormatter={(value) => `R$ ${value}`} />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="Compra" name="Compra" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Venda" name="Venda" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;