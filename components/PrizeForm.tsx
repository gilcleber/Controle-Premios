import React, { useState, useEffect } from 'react';
import { Prize, UserRole } from '../types';

import { Sparkles, Loader2, Save, X, Radio, Plus, Edit2, PackagePlus } from 'lucide-react';

interface PrizeFormProps {
  initialData?: Prize;
  role?: UserRole; // Recebe role
  prizes?: Prize[];
  onSave: (prize: Prize, sourcePrizeId?: string, refundPrizeId?: string, additionalPrizes?: { prizeId: string, quantity: number }[]) => void;
  onCancel: () => void;
  forceOnAir?: boolean;
}

export const PrizeForm: React.FC<PrizeFormProps> = ({ initialData, role, prizes = [], onSave, onCancel, forceOnAir = false }) => {
  // Oculta campos avançados (prazos/no-ar) se for MASTER ou ADMIN (Cadastro Simplificado)
  const isMaster = role === 'MASTER' || role === 'ADMIN';
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
    photo_url: '', // Foto
    scheduled_for: '', // Agendamento
  });

  // ... (previous state hooks: debitFromStock, selectedSourceId, etc)
  const [debitFromStock, setDebitFromStock] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [isSwappingStock, setIsSwappingStock] = useState(false);
  const [refundSourceId, setRefundSourceId] = useState('');
  const [additionalPrizes, setAdditionalPrizes] = useState<{ prizeId: string, quantity: number }[]>([]);

  // Photo Upload Handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo_url: '' }));
  };

  // ... (useEffect hook)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (forceOnAir) {
      setFormData(prev => ({ ...prev, isOnAir: true }));
    }
  }, [initialData, forceOnAir]);

  // ... (handleChange hook)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Calculate new state
    const newValue = name === 'totalQuantity' || name === 'pickupDeadlineDays' || name === 'availableQuantity' ? parseInt(value) || 0 : value;

    setFormData(prev => {
      const newState = { ...prev, [name]: newValue };

      // Smart Update: If changing Total Quantity, update Available Quantity automatically
      if (name === 'totalQuantity') {
        const newTotal = newValue as number;
        if (initialData) {
          // Edit Mode: Maintain difference
          const delta = newTotal - initialData.totalQuantity;
          newState.availableQuantity = initialData.availableQuantity + delta;
        } else {
          // New Mode: Avail = Total
          newState.availableQuantity = newTotal;
        }
      }

      return newState;
    });
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
    // Use form value (which might be edited or auto-calculated) or fallback to quantity
    const available = formData.availableQuantity !== undefined ? formData.availableQuantity : quantity;

    // Se for Master, define defaults para campos ocultos
    const finalPickupDays = isMaster ? 30 : (formData.pickupDeadlineDays || 3);
    const finalIsOnAir = isMaster ? false : (formData.isOnAir || false);
    // Para maxDrawDate, se Master, deixar vazio ou 1 ano pra frente? Vou deixar vazio se nao preenchido.
    // O backend ou front deve lidar com string vazia.

    const prizeToSave: Prize = {
      id: initialData?.id || crypto.randomUUID(),
      name: formData.name || 'Sem nome',
      description: formData.description || '',
      totalQuantity: quantity,
      availableQuantity: available,
      entryDate: formData.entryDate || new Date().toISOString(),
      validityDate: formData.validityDate || '',
      maxDrawDate: formData.maxDrawDate || '',
      pickupDeadlineDays: finalPickupDays,
      isOnAir: finalIsOnAir,
      photo_url: formData.photo_url, // Salva Foto
      scheduled_for: formData.scheduled_for, // Salva Agendamento
    };
    onSave(prizeToSave, debitFromStock ? selectedSourceId : undefined, isSwappingStock ? refundSourceId : undefined, additionalPrizes);
  };
  // ... (handleSourceSelect)
  const handleSourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sourceId = e.target.value;
    setSelectedSourceId(sourceId);
    if (sourceId) {
      const sourcePrize = prizes.find(p => p.id === sourceId);
      if (sourcePrize) {
        setFormData(prev => ({
          ...prev,
          name: sourcePrize.name,
          description: sourcePrize.description,
          pickupDeadlineDays: sourcePrize.pickupDeadlineDays,
          validityDate: sourcePrize.validityDate,
          maxDrawDate: sourcePrize.maxDrawDate,
          totalQuantity: 1,
          availableQuantity: 1,
          photo_url: sourcePrize.photo_url // Copy photo
        }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {initialData ? <Edit2 size={20} /> : (forceOnAir ? <Radio size={20} /> : <Plus size={20} />)}
            {initialData ? 'Editar Prêmio' : (forceOnAir ? 'Separar Prêmios para Sorteio' : (isMaster ? 'Cadastrar Item de Estoque' : 'Cadastrar Estoque'))}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Upload de Foto (Exibe sempre, muito importante para Master) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
            <label className="block text-sm font-bold text-gray-700 mb-2">Foto do Item (Opcional)</label>
            {formData.photo_url ? (
              <div className="relative inline-block">
                <img src={formData.photo_url} alt="Preview" className="h-32 object-contain rounded-md border border-gray-300" />
                <button type="button" onClick={handleRemovePhoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer inline-flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PackagePlus className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> foto</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>

          {/* On Air Toggle & Scheduling - OCULTO PARA MASTER */}
          {!isMaster && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-gray-800 flex items-center gap-2">
                    <Radio size={18} className={formData.isOnAir ? "text-blue-600" : "text-gray-400"} />
                    Disponível no Ar? (Manual)
                  </span>
                  <span className="text-xs text-gray-500">Se marcado, aparece IMEDIATAMENTE.</span>
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

              {/* Scheduling Input */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 p-1 rounded"><Sparkles size={14} /></span>
                  Agendar Sorteio (Automático)
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_for"
                  value={formData.scheduled_for || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se definido, o item aparecerá para o locutor <strong>30 minutos antes</strong> deste horário.
                </p>
              </div>
            </div>
          )}

          {/* ... (Swap Stock / Debit Logic omitidos para brevidade, mantendo-os se estiverem no arquivo original abaixo - ESTE BLOCO SUBSTITUI O INICIO DO ARQUIVO ATE A SEÇÃO DE INPUTS) */}

          {/* Inputs de Texto */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Total</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Disponível</label>
              <input
                type="number"
                name="availableQuantity"
                min="0"
                required
                value={formData.availableQuantity}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-blue-300/50 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                title="Calculado automaticamente, mas você pode corrigir se necessário."
              />
            </div>

            {/* Prazo Retirada - OCULTO PARA MASTER */}
            {!isMaster && (
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
            )}

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

            {/* Prazo Max Sorteio - OCULTO PARA MASTER */}
            {!isMaster && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Max. Sorteio</label>
                <input
                  type="date"
                  name="maxDrawDate"
                  required={!isMaster} // Só obrigatório se não for Master
                  value={formData.maxDrawDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}
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
      </div >
    </div >
  );
};