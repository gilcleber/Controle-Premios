import React, { useState, useEffect } from 'react';
import { Prize } from '../types';

import { Sparkles, Loader2, Save, X, Radio, Plus, Edit2 } from 'lucide-react';

interface PrizeFormProps {
  initialData?: Prize;
  onSave: (prize: Prize) => void;
  onCancel: () => void;
  forceOnAir?: boolean; // Se true, já vem marcado para ir pro ar
}

export const PrizeForm: React.FC<PrizeFormProps> = ({ initialData, onSave, onCancel, forceOnAir = false }) => {
  const [formData, setFormData] = useState<Partial<Prize>>({
    name: '',
    description: '',
    totalQuantity: 1,
    availableQuantity: 1,
    entryDate: new Date().toISOString().split('T')[0],
    validityDate: '',
    maxDrawDate: '',
    pickupDeadlineDays: 3,
    isOnAir: forceOnAir,
  });

  const [aiScript, setAiScript] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (forceOnAir) {
      setFormData(prev => ({ ...prev, isOnAir: true }));
    }
  }, [initialData, forceOnAir]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalQuantity' || name === 'pickupDeadlineDays' ? parseInt(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = formData.totalQuantity || 1;

    const prizeToSave: Prize = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name || 'Sem nome',
      description: formData.description || '',
      totalQuantity: quantity,
      availableQuantity: initialData ? initialData.availableQuantity : quantity,
      entryDate: formData.entryDate || new Date().toISOString(),
      validityDate: formData.validityDate || '',
      maxDrawDate: formData.maxDrawDate || '',
      pickupDeadlineDays: formData.pickupDeadlineDays || 3,
      isOnAir: formData.isOnAir || false,
    };
    onSave(prizeToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {initialData ? <Edit2 size={20} /> : (forceOnAir ? <Radio size={20} /> : <Plus size={20} />)}
            {initialData ? 'Editar Prêmio' : (forceOnAir ? 'Sorteio Rápido (Já no Ar)' : 'Cadastrar Estoque')}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* On Air Toggle Switch */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
            <div>
              <span className="block font-bold text-gray-800 flex items-center gap-2">
                <Radio size={18} className={formData.isOnAir ? "text-blue-600" : "text-gray-400"} />
                Disponível no Ar?
              </span>
              <span className="text-xs text-gray-500">Se marcado, aparece na tela do locutor imediatamente.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isOnAir"
                checked={!!formData.isOnAir}
                onChange={handleCheckboxChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

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