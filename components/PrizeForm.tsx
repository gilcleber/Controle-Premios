import React, { useState, useEffect } from 'react';
import { Prize } from '../types';
import { generatePrizeScript } from '../services/geminiService';
import { Sparkles, Loader2, Save, X } from 'lucide-react';

interface PrizeFormProps {
  initialData?: Prize;
  onSave: (prize: Prize) => void;
  onCancel: () => void;
}

export const PrizeForm: React.FC<PrizeFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Prize>>({
    name: '',
    description: '',
    totalQuantity: 1,
    availableQuantity: 1,
    entryDate: new Date().toISOString().split('T')[0],
    validityDate: '',
    maxDrawDate: '',
    pickupDeadlineDays: 3,
  });

  const [aiScript, setAiScript] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalQuantity' || name === 'pickupDeadlineDays' ? parseInt(value) || 0 : value
    }));
  };

  const handleGenerateScript = async () => {
    if (!formData.name) return;
    setLoadingAi(true);
    const script = await generatePrizeScript(formData.name, formData.description || '');
    setAiScript(script);
    setLoadingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to sync available quantity if it's a new item or if total changed significantly
    // For simplicity, if it's new, available = total. 
    // If editing, we assume the user manages quantities carefully or we calculate difference.
    // Here we strictly follow the form state for simplicity in this demo.
    
    const quantity = formData.totalQuantity || 1;
    
    // If it's a new record
    const prizeToSave: Prize = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name || 'Sem nome',
      description: formData.description || '',
      totalQuantity: quantity,
      availableQuantity: initialData ? initialData.availableQuantity : quantity, // Preserve available count on edit, else set to total
      entryDate: formData.entryDate || new Date().toISOString(),
      validityDate: formData.validityDate || '',
      maxDrawDate: formData.maxDrawDate || '',
      pickupDeadlineDays: formData.pickupDeadlineDays || 3,
    };
    onSave(prizeToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Editar Prêmio' : 'Novo Prêmio'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Prêmio</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ex: Par de Ingressos Cinema"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Detalhes do prêmio..."
              />
            </div>

            {/* AI Assistant Section */}
            <div className="col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-indigo-800 font-medium flex items-center gap-2">
                  <Sparkles size={16} /> Assistente de Locução (IA)
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateScript}
                  disabled={loadingAi || !formData.name}
                  className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {loadingAi ? <Loader2 size={12} className="animate-spin" /> : 'Gerar Roteiro'}
                </button>
              </div>
              {aiScript && (
                <div className="text-sm text-indigo-900 italic bg-white p-3 rounded border border-indigo-100">
                  "{aiScript}"
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Entrada</label>
              <input
                type="number"
                name="totalQuantity"
                min="1"
                required
                value={formData.totalQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Retirada (Dias Úteis)</label>
              <input
                type="number"
                name="pickupDeadlineDays"
                min="1"
                value={formData.pickupDeadlineDays}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
              <input
                type="date"
                name="entryDate"
                required
                value={formData.entryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
              <input
                type="date"
                name="validityDate"
                required
                value={formData.validityDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Max. Sorteio</label>
              <input
                type="date"
                name="maxDrawDate"
                required
                value={formData.maxDrawDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18} /> Salvar Prêmio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};