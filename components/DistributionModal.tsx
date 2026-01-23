import React, { useState, useEffect } from 'react';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { MasterInventory, RadioStation } from '../types';

interface DistributionModalProps {
    item: MasterInventory;
    onClose: () => void;
    onDistributed: () => void;
}

export const DistributionModal: React.FC<DistributionModalProps> = ({
    item,
    onClose,
    onDistributed,
}) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [notes, setNotes] = useState('');
    const [distributing, setDistributing] = useState(false);

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        const { data, error } = await supabase
            .from('radio_stations')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Erro ao buscar estações:', error);
            return;
        }

        setStations(data || []);
    };

    const handleDistribute = async () => {
        if (!selectedStation) {
            alert('Selecione uma estação!');
            return;
        }

        if (quantity < 1 || quantity > item.available_quantity) {
            alert('Quantidade inválida!');
            return;
        }

        setDistributing(true);

        try {
            // 1. Criar prêmio na estação destino
            const { data: prizeData, error: prizeError } = await supabase
                .from('prizes')
                .insert({
                    name: item.item_name,
                    description: item.description || '',
                    totalQuantity: quantity,
                    availableQuantity: quantity,
                    entryDate: new Date().toISOString(),
                    validityDate: item.validity_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    maxDrawDate: item.validity_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                    pickupDeadlineDays: 3,
                    isOnAir: false,
                    radio_station_id: selectedStation,
                    source_master_id: item.id,
                })
                .select()
                .single();

            if (prizeError) throw prizeError;

            // 2. Registrar distribuição no histórico
            const { error: historyError } = await supabase.from('distribution_history').insert({
                master_inventory_id: item.id,
                radio_station_id: selectedStation,
                prize_id: prizeData.id,
                quantity_distributed: quantity,
                notes: notes,
            });

            if (historyError) throw historyError;

            // 3. Atualizar quantidade disponível no estoque central
            const { error: updateError } = await supabase
                .from('master_inventory')
                .update({
                    available_quantity: item.available_quantity - quantity,
                })
                .eq('id', item.id);

            if (updateError) throw updateError;

            alert('✅ Distribuição realizada com sucesso!');
            onDistributed();
            onClose();
        } catch (error: any) {
            alert(`Erro ao distribuir: ${error.message}`);
        } finally {
            setDistributing(false);
        }
    };

    const selectedStationData = stations.find((s) => s.id === selectedStation);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-indigo-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ArrowRight size={20} className="text-indigo-600" />
                            Distribuir Item
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{item.item_name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Info do Item */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium">Categoria</p>
                                <p className="text-gray-900 font-bold">{item.category}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Fornecedor</p>
                                <p className="text-gray-900 font-bold">{item.supplier || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Total</p>
                                <p className="text-gray-900 font-bold">{item.total_quantity}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Disponível</p>
                                <p className="text-green-600 font-bold text-lg">{item.available_quantity}</p>
                            </div>
                        </div>
                    </div>

                    {/* Seleção de Estação */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Estação Destino *
                        </label>
                        <select
                            value={selectedStation}
                            onChange={(e) => setSelectedStation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                        >
                            <option value="">Selecione uma estação...</option>
                            {stations.map((station) => (
                                <option key={station.id} value={station.id}>
                                    {station.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantidade */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Quantidade a Distribuir *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={item.available_quantity}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Máximo: {item.available_quantity} unidades
                        </p>
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Observações (Opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            rows={2}
                            placeholder="Notas sobre essa distribuição..."
                        />
                    </div>

                    {/* Preview */}
                    {selectedStation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                                <p className="font-bold">Confirmação</p>
                                <p className="mt-1">
                                    Serão distribuídas <strong>{quantity} unidade(s)</strong> de{' '}
                                    <strong>{item.item_name}</strong> para <strong>{selectedStationData?.name}</strong>.
                                </p>
                                <p className="mt-1 text-xs">
                                    Um novo prêmio será criado no estoque da estação.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDistribute}
                            disabled={distributing || !selectedStation}
                            className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <ArrowRight size={18} />
                            {distributing ? 'Distribuindo...' : 'Confirmar Distribuição'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
