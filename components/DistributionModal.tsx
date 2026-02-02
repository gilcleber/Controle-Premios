import React, { useState, useEffect } from 'react';
import { X, ArrowRight, AlertTriangle, Calendar, Clock, Radio, Plus, Trash } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { Prize, RadioStation, UserRole } from '../types';

interface DistributionModalProps {
    item: Prize;
    show?: boolean;
    onClose: () => void;
    onDistributed: () => void;
    userRole?: UserRole | null;
}

export const DistributionModal: React.FC<DistributionModalProps> = ({
    item,
    onClose,
    onDistributed,
    userRole
}) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [distributing, setDistributing] = useState(false);

    // Admin Split Mode state
    const isAdmin = userRole === 'ADMIN';
    const [scheduledFor, setScheduledFor] = useState('');
    const [isOnAirNow, setIsOnAirNow] = useState(false);

    // Combo/Bonus State
    const [availablePrizes, setAvailablePrizes] = useState<Prize[]>([]);
    const [selectedComboPrizes, setSelectedComboPrizes] = useState<{ prizeId: string, quantity: number }[]>([]);

    useEffect(() => {
        if (!isAdmin) {
            fetchStations();
        } else {
            fetchAvailablePrizes();
        }
    }, [isAdmin]);

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

    const fetchAvailablePrizes = async () => {
        // Fetch prizes for combo selection (exclude current item)
        // Only fetch items with available stock
        const { data, error } = await supabase
            .from('prizes')
            .select('*')
            .gt('availableQuantity', 0)
            .neq('id', item.id) // Exclude self
            .order('name');

        if (error) {
            console.error("Erro ao buscar prêmios:", error);
            return;
        }
        setAvailablePrizes(data || []);
    };

    const handleAddComboItem = (prizeId: string) => {
        if (!prizeId) return;
        if (selectedComboPrizes.find(p => p.prizeId === prizeId)) return;
        setSelectedComboPrizes([...selectedComboPrizes, { prizeId, quantity: 1 }]);
    };

    const handleRemoveComboItem = (prizeId: string) => {
        setSelectedComboPrizes(selectedComboPrizes.filter(p => p.prizeId !== prizeId));
    };

    const handleUpdateComboQuantity = (prizeId: string, qty: number) => {
        const maxQty = availablePrizes.find(p => p.id === prizeId)?.availableQuantity || 1;
        const validQty = Math.max(1, Math.min(qty, maxQty));

        setSelectedComboPrizes(prev => prev.map(p =>
            p.prizeId === prizeId ? { ...p, quantity: validQty } : p
        ));
    };

    const handleDistribute = async () => {
        if (!isAdmin && !selectedStation) {
            alert('Selecione uma estação!');
            return;
        }

        if (quantity < 1 || quantity > item.availableQuantity) {
            alert('Quantidade inválida!');
            return;
        }

        setDistributing(true);

        try {
            if (isAdmin) {
                // --- ADMIN INTERNAL SPLIT LOGIC ---
                // 1. Create a COPY of the item with new quantity and schedule
                // Store comboDetails to track the extra items allocated

                const { error: insertError } = await supabase
                    .from('prizes')
                    .insert({
                        id: crypto.randomUUID(),
                        name: item.name,
                        description: item.description,
                        totalQuantity: quantity,
                        availableQuantity: quantity,
                        entryDate: new Date().toISOString(),
                        validityDate: item.validityDate,
                        maxDrawDate: item.maxDrawDate,
                        pickupDeadlineDays: item.pickupDeadlineDays,
                        isOnAir: isOnAirNow,
                        scheduled_for: scheduledFor || null,
                        radio_station_id: item.radio_station_id,
                        source_master_id: item.source_master_id || item.id,
                        photo_url: item.photo_url,
                        comboDetails: selectedComboPrizes // Save combo structure
                    });

                if (insertError) throw insertError;

                // 2. Debit Stock of Combo Items
                for (const combo of selectedComboPrizes) {
                    const originalPrize = availablePrizes.find(p => p.id === combo.prizeId);
                    if (originalPrize) {
                        const newQty = originalPrize.availableQuantity - combo.quantity;
                        await supabase
                            .from('prizes')
                            .update({ availableQuantity: newQty })
                            .eq('id', combo.prizeId);
                    }
                }

            } else {
                // --- MASTER DISTRIBUTION LOGIC (Existing) ---
                const masterId = item.source_master_id || item.id;

                const { data: existingPrize } = await supabase
                    .from('prizes')
                    .select('*')
                    .eq('radio_station_id', selectedStation)
                    .eq('source_master_id', masterId) // Link pelo ID original
                    .single();

                if (existingPrize) {
                    // UPDATE
                    const { error: updatePrizeError } = await supabase
                        .from('prizes')
                        .update({
                            totalQuantity: existingPrize.totalQuantity + quantity,
                            availableQuantity: existingPrize.availableQuantity + quantity,
                        })
                        .eq('id', existingPrize.id);

                    if (updatePrizeError) throw updatePrizeError;
                } else {
                    // INSERT
                    const { error: insertError } = await supabase
                        .from('prizes')
                        .insert({
                            id: crypto.randomUUID(),
                            name: item.name,
                            description: item.description || '',
                            totalQuantity: quantity,
                            availableQuantity: quantity,
                            entryDate: new Date().toISOString(),
                            validityDate: item.validityDate,
                            maxDrawDate: item.maxDrawDate,
                            pickupDeadlineDays: 3,
                            isOnAir: false,
                            radio_station_id: selectedStation,
                            source_master_id: masterId,
                            photo_url: item.photo_url
                        });

                    if (insertError) throw insertError;
                }
            }

            // Common: Debit from Origin (Main Item)
            const { error: updateError } = await supabase
                .from('prizes')
                .update({
                    availableQuantity: item.availableQuantity - quantity,
                })
                .eq('id', item.id);

            if (updateError) throw updateError;

            alert(isAdmin ? '✅ Item separado com sucesso!' : '✅ Distribuição realizada com sucesso!');
            onDistributed();
            onClose();
        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error.message} `);
        } finally {
            setDistributing(false);
        }
    };

    const selectedStationData = stations.find((s) => s.id === selectedStation);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
                <div className="p-6 border-b border-gray-100 bg-indigo-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {isAdmin ? <Calendar size={20} className="text-indigo-600" /> : <ArrowRight size={20} className="text-indigo-600" />}
                            {isAdmin ? 'Separar / Agendar Item' : 'Distribuir Item'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{item.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium">Item</p>
                                <p className="text-gray-900 font-bold truncate">{item.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Disponível</p>
                                <p className="text-green-600 font-bold text-lg">{item.availableQuantity}</p>
                            </div>
                        </div>
                    </div>

                    {!isAdmin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                Estação Destino *
                            </label>
                            <select
                                value={selectedStation}
                                onChange={(e) => setSelectedStation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium text-gray-700"
                            >
                                <option value="">Selecione uma estação...</option>
                                {stations.map((station) => (
                                    <option key={station.id} value={station.id}>
                                        {station.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Quantidade a Separar *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={item.availableQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Máximo: {item.availableQuantity} unidades
                        </p>
                    </div>

                    {isAdmin && (
                        <>
                            {/* COMBO SECTION */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Adicionar Prêmio Extra (Combo)
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <select
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onChange={(e) => handleAddComboItem(e.target.value)}
                                        value=""
                                    >
                                        <option value="">+ Incluir item adicional...</option>
                                        {availablePrizes
                                            .filter(p => !selectedComboPrizes.find(cp => cp.prizeId === p.id))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (Disp: {p.availableQuantity})</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {selectedComboPrizes.length > 0 && (
                                    <div className="space-y-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                        {selectedComboPrizes.map((combo) => {
                                            const original = availablePrizes.find(p => p.id === combo.prizeId);
                                            if (!original) return null;
                                            return (
                                                <div key={combo.prizeId} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100 shadow-sm">
                                                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">{original.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-gray-400">Qtd:</span>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={original.availableQuantity}
                                                            value={combo.quantity}
                                                            onChange={(e) => handleUpdateComboQuantity(combo.prizeId, parseInt(e.target.value) || 1)}
                                                            className="w-14 px-1 py-1 text-center border border-gray-200 rounded text-sm font-bold"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveComboItem(combo.prizeId)}
                                                        className="text-red-400 hover:text-red-600 p-1"
                                                    >
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-2 border-t border-gray-100">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                        <Clock size={14} /> Agendar para (Data e Hora)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={scheduledFor}
                                        onChange={(e) => setScheduledFor(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">O item aparecerá para o locutor (operador) neste horário.</p>
                                </div>

                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isOnAirNow"
                                        checked={isOnAirNow}
                                        onChange={(e) => setIsOnAirNow(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                                    />
                                    <label htmlFor="isOnAirNow" className="text-sm font-bold text-indigo-900 cursor-pointer select-none flex items-center gap-2">
                                        <Radio size={16} /> Liberar no ar agora mesmo?
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {!isAdmin && selectedStation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertTriangle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-900">
                                <p className="font-bold">Resumo da Transferência</p>
                                <ul className="mt-1 space-y-1 list-disc list-inside opacity-90">
                                    <li>Origem: <strong>Estoque Geral</strong> (-{quantity})</li>
                                    <li>Destino: <strong>{selectedStationData?.name}</strong> (+{quantity})</li>
                                </ul>
                                <p className="mt-2 text-xs italic opacity-70">
                                    O item será debitado do estoque geral e creditado (ou criado) no estoque da rádio selecionada.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDistribute}
                            disabled={distributing || (!isAdmin && !selectedStation)}
                            className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            <ArrowRight size={18} />
                            {distributing ? 'Processando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
