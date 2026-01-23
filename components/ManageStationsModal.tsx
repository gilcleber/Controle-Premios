import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, Radio, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { RadioStation } from '../types';

interface ManageStationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStationsUpdated: () => void;
}

export const ManageStationsModal: React.FC<ManageStationsModalProps> = ({
    isOpen,
    onClose,
    onStationsUpdated,
}) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [newStationName, setNewStationName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchStations();
        }
    }, [isOpen]);

    const fetchStations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('radio_stations')
            .select('*')
            .eq('is_active', true)
            .order('name');

        if (data) setStations(data);
        setLoading(false);
    };

    const handleAddStation = async () => {
        if (!newStationName.trim()) return;

        try {
            const slug = newStationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const { error } = await supabase
                .from('radio_stations')
                .insert({ name: newStationName.trim(), slug, is_active: true });

            if (error) throw error;

            setNewStationName('');
            await fetchStations();
            onStationsUpdated();
        } catch (error: any) {
            alert('Erro ao adicionar: ' + error.message);
        }
    };

    const handleDeleteStation = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover a estação "${name}"? Isso pode ocultar dados históricos.`)) return;

        try {
            // Soft delete
            const { error } = await supabase
                .from('radio_stations')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;

            await fetchStations();
            onStationsUpdated();
        } catch (error: any) {
            alert('Erro ao remover: ' + error.message);
        }
    };

    const startEditing = (station: RadioStation) => {
        setEditingId(station.id);
        setEditName(station.name);
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) return;

        try {
            const { error } = await supabase
                .from('radio_stations')
                .update({ name: editName.trim() })
                .eq('id', editingId);

            if (error) throw error;

            setEditingId(null);
            await fetchStations();
            onStationsUpdated();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Radio size={24} className="text-blue-600" />
                            Gerenciar Estações
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Adicione, edite ou remova estações da rede.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Add New */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Adicionar Nova Estação</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newStationName}
                                onChange={e => setNewStationName(e.target.value)}
                                placeholder="Nome da nova estação (ex: Rádio Pop)"
                                className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                                onClick={handleAddStation}
                                disabled={!newStationName.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Adicionar
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            Estações Ativas <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{stations.length}</span>
                        </h4>

                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Carregando estações...</div>
                        ) : stations.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <Radio size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">Nenhuma estação cadastrada.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {stations.map(station => (
                                    <div key={station.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow group">
                                        <div className="flex-1">
                                            {editingId === station.id ? (
                                                <div className="flex gap-2 mr-4">
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                        {station.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{station.name}</p>
                                                        <p className="text-xs text-gray-400 font-mono">{station.id.slice(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {editingId === station.id ? (
                                                <>
                                                    <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Salvar">
                                                        <Save size={18} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg" title="Cancelar">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditing(station)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteStation(station.id, station.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold mr-2">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
