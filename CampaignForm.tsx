import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { 
  salvarCampanha, 
  calcularLucros, 
  formatCurrency, 
  formatPercent, 
  maskDateInput, 
  convertBrDateToISO, 
  convertIsoToBrDate 
} from '../services/campaignService';
import { Save, X, AlertCircle, Calendar } from 'lucide-react';

interface CampaignFormProps {
  existingCampaign?: Campaign | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ existingCampaign, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    campanha: '',
    data_inicio: '', // Will hold DD/MM/YYYY
    data_fim: '', // Will hold DD/MM/YYYY
    quantidade_clientes: '',
    valor_venda: '',
    valor_compra: '',
    observacoes: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [previewLucro, setPreviewLucro] = useState<{ real: number, percent: number } | null>(null);

  useEffect(() => {
    if (existingCampaign) {
      setFormData({
        campanha: existingCampaign.campanha,
        data_inicio: convertIsoToBrDate(existingCampaign.data_inicio),
        data_fim: convertIsoToBrDate(existingCampaign.data_fim),
        quantidade_clientes: existingCampaign.quantidade_clientes.toString(),
        valor_venda: existingCampaign.valor_venda.toString(),
        valor_compra: existingCampaign.valor_compra.toString(),
        observacoes: existingCampaign.observacoes || ''
      });
    }
  }, [existingCampaign]);

  // Real-time calculation effect
  useEffect(() => {
    const vVenda = parseFloat(formData.valor_venda);
    const vCompra = parseFloat(formData.valor_compra);
    
    if (!isNaN(vVenda) && !isNaN(vCompra)) {
      const result = calcularLucros(vVenda, vCompra);
      setPreviewLucro({ real: result.lucro_real, percent: result.percentual_lucro });
    } else {
      setPreviewLucro(null);
    }
  }, [formData.valor_venda, formData.valor_compra]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'data_inicio' || name === 'data_fim') {
      setFormData(prev => ({ ...prev, [name]: maskDateInput(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Convert dates for validation and storage
    const isoInicio = convertBrDateToISO(formData.data_inicio);
    const isoFim = convertBrDateToISO(formData.data_fim);

    // Validation
    if (!formData.campanha || !isoInicio || !isoFim || !formData.valor_venda || !formData.valor_compra) {
      setError("Por favor, preencha todos os campos obrigatórios corretamente.");
      if (!isoInicio || !isoFim) setError("Datas inválidas. Use o formato DD/MM/AAAA.");
      return;
    }

    if (isoFim < isoInicio) {
      setError("A Data Fim não pode ser anterior à Data Início.");
      return;
    }

    try {
      salvarCampanha({
        id: existingCampaign?.id,
        campanha: formData.campanha,
        data_inicio: isoInicio,
        data_fim: isoFim,
        quantidade_clientes: parseInt(formData.quantidade_clientes) || 0,
        valor_venda: parseFloat(formData.valor_venda),
        valor_compra: parseFloat(formData.valor_compra),
        observacoes: formData.observacoes
      });
      onSuccess();
    } catch (err) {
      setError("Erro ao salvar campanha. Verifique os dados.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {existingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center text-red-700">
          <AlertCircle size={20} className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Campanha *</label>
          <input
            type="text"
            name="campanha"
            value={formData.campanha}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Ex: Promoção Black Friday"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Início (DD/MM/AAAA) *</label>
            <div className="relative">
              <input
                type="tel"
                name="data_inicio"
                value={formData.data_inicio}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim (DD/MM/AAAA) *</label>
            <div className="relative">
              <input
                type="tel"
                name="data_fim"
                value={formData.data_fim}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
               <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Clientes</label>
            <input
              type="number"
              name="quantidade_clientes"
              value={formData.quantidade_clientes}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Venda (R$) *</label>
            <input
              type="number"
              name="valor_venda"
              value={formData.valor_venda}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor Compra (R$) *</label>
            <input
              type="number"
              name="valor_compra"
              value={formData.valor_compra}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Live Preview Calculation */}
        {previewLucro && (
          <div className="bg-indigo-50 rounded-lg p-4 flex flex-col md:flex-row md:justify-around border border-indigo-100">
            <div className="text-center mb-2 md:mb-0">
              <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">Lucro Estimado</span>
              <span className={`text-xl font-bold ${previewLucro.real >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(previewLucro.real)}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">Margem (%)</span>
              <span className={`text-xl font-bold ${previewLucro.percent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatPercent(previewLucro.percent)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          ></textarea>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center shadow-md shadow-indigo-200"
          >
            <Save size={18} className="mr-2" />
            {existingCampaign ? 'Atualizar' : 'Concluir Cadastro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;