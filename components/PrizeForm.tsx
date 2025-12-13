import React, { useState, useEffect } from 'react';
import { Prize } from '../types';

import { Sparkles, Loader2, Save, X, Radio, Plus, Edit2, PackagePlus } from 'lucide-react';

interface PrizeFormProps {
  initialData?: Prize;
  prizes?: Prize[];
  onSave: (prize: Prize, sourcePrizeId?: string, refundPrizeId?: string, additionalPrizes?: { prizeId: string, quantity: number }[]) => void;
  onCancel: () => void;
  forceOnAir?: boolean; // Se true, já vem marcado para ir pro ar
}

export const PrizeForm: React.FC<PrizeFormProps> = ({ initialData, prizes = [], onSave, onCancel, forceOnAir = false }) => {
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

  const [debitFromStock, setDebitFromStock] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState('');

  // Swap Stock State (Correction Mode)
  const [isSwappingStock, setIsSwappingStock] = useState(false);
  const [refundSourceId, setRefundSourceId] = useState('');

  const [aiScript, setAiScript] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Combo / Additional Prizes State
  const [additionalPrizes, setAdditionalPrizes] = useState<{ prizeId: string, quantity: number }[]>([]);

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
    onSave(prizeToSave, debitFromStock ? selectedSourceId : undefined, isSwappingStock ? refundSourceId : undefined, additionalPrizes);
  };

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
          // Mantém a quantidade como 1 por padrão para o novo sorteio
          totalQuantity: 1
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
            {initialData ? 'Editar Prêmio' : (forceOnAir ? 'Separar Prêmios para Sorteio' : 'Cadastrar Estoque')}
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



          {/* Swap Stock Option (Only for Editing) */}
          {initialData && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-amber-800 flex items-center gap-2">
                  <PackagePlus size={18} />
                  Corrigir/Trocar Estoque?
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSwappingStock}
                    onChange={(e) => {
                      setIsSwappingStock(e.target.checked);
                      setDebitFromStock(e.target.checked); // Enable debit logic too
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {isSwappingStock && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">1. Devolver saldo para:</label>
                    <select
                      value={refundSourceId}
                      onChange={(e) => setRefundSourceId(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    >
                      <option value="">-- Selecione onde devolver --</option>
                      {prizes.filter(p => !p.isOnAir).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Atual: {p.availableQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-1">2. Debitar novo saldo de:</label>
                    <select
                      value={selectedSourceId}
                      onChange={handleSourceSelect}
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    >
                      <option value="">-- Selecione o novo item --</option>
                      {prizes.filter(p => p.availableQuantity > 0 && !p.isOnAir).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Disp: {p.availableQuantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    * A quantidade ({formData.totalQuantity}) será devolvida para o item 1 e debitada do item 2.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Debit from Stock Option (Only for Quick Draw) */}
          {!initialData && forceOnAir && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-orange-800 flex items-center gap-2">
                  <PackagePlus size={18} />
                  Debitar do Estoque?
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={debitFromStock}
                    onChange={(e) => setDebitFromStock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {debitFromStock && (
                <div>
                  <label className="block text-sm font-medium text-orange-900 mb-1">Selecione o Item do Estoque</label>
                  <select
                    value={selectedSourceId}
                    onChange={handleSourceSelect}
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Selecione um prêmio --</option>
                    {prizes.filter(p => p.availableQuantity > 0 && !p.isOnAir).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Disp: {p.availableQuantity})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-orange-700 mt-1">
                    * Ao salvar, a quantidade será descontada automaticamente deste item.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Combo / Additional Prizes Section (Only for Quick Draw) */}
          {!initialData && forceOnAir && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <PackagePlus size={18} /> Adicionar + Prêmios (Combo)
              </label>
              <p className="text-xs text-indigo-700 mb-3">
                Adicione itens extras para formar um kit (ex: + Boné, + Camiseta). O estoque será debitado automaticamente.
              </p>

              <div className="space-y-2 mb-3">
                {additionalPrizes.map((extra, index) => {
                  const p = prizes.find(p => p.id === extra.prizeId);
                  return (
                    <div key={index} className="flex gap-2 items-center text-sm bg-white p-2 rounded border border-indigo-100 shadow-sm">
                      <span className="font-bold text-gray-700 flex-1">{p?.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Qtd:</span>
                        <input
                          type="number"
                          min="1"
                          max={p?.availableQuantity || 1}
                          value={extra.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 1;
                            setAdditionalPrizes(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQty } : item));
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <button type="button" onClick={() => setAdditionalPrizes(prev => prev.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"><X size={14} /></button>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <select
                  className="flex-1 text-sm border border-indigo-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      const prizeId = e.target.value;
                      const prize = prizes.find(p => p.id === prizeId);
                      if (prize) {
                        // Check if already added
                        const exists = additionalPrizes.find(a => a.prizeId === prizeId);
                        if (!exists) {
                          setAdditionalPrizes(prev => [...prev, { prizeId, quantity: 1 }]);
                        }
                      }
                      e.target.value = ""; // Reset select
                    }
                  }}
                >
                  <option value="">+ Selecionar prêmio extra...</option>
                  {prizes.filter(p => p.id !== selectedSourceId && p.availableQuantity > 0 && !p.isOnAir).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Disp: {p.availableQuantity})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
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
      </div >
    </div >
  );
};