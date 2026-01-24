import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save, Radio, Eye, EyeOff, Key, Copy, Check } from 'lucide-react';
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
    const [newSlug, setNewSlug] = useState('');
    const [newPin, setNewPin] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editPin, setEditPin] = useState('');
    const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

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

    const handleNameChange = (value: string) => {
        setNewStationName(value);
        // Auto-gerar slug
        const autoSlug = value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 50);
        setNewSlug(autoSlug);
    };

    const generateRandomPin = () => {
        const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
        setNewPin(randomPin);
    };

    const handleAddStation = async () => {
        if (!newStationName.trim() || !newSlug.trim() || !newPin.trim()) {
            alert('Preencha nome, slug e PIN');
            return;
        }

        try {
            const { error } = await supabase
                .from('radio_stations')
                .insert({
                    name: newStationName.trim(),
                    slug: newSlug.trim(),
                    access_pin: newPin.trim(),
                    is_active: true
                });

            if (error) {
                if (error.code === '23505') {
                    alert('Já existe uma rádio com este slug');
                } else {
                    throw error;
                }
                return;
            }

            setNewStationName('');
            setNewSlug('');
            setNewPin('');
            await fetchStations();
            onStationsUpdated();
        } catch (error: any) {
            alert('Erro ao adicionar: ' + error.message);
        }
    };

    const handleDeleteStation = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover a estação "${name}"?`)) return;

        try {
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
        setEditSlug(station.slug);
        setEditPin(station.access_pin || '');
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim() || !editSlug.trim()) return;

        try {
            const { error } = await supabase
                .from('radio_stations')
                .update({
                    name: editName.trim(),
                    slug: editSlug.trim(),
                    access_pin: editPin.trim()
                })
                .eq('id', editingId);

            if (error) throw error;

            setEditingId(null);
            await fetchStations();
            onStationsUpdated();
        } catch (error: any) {
            alert('Erro ao salvar: ' + error.message);
        }
    };

    const togglePinVisibility = (id: string) => {
        setShowPins(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyAccessInfo = async (station: RadioStation) => {
        const link = `https://gilcleber.github.io/Controle-Premios/?radio=${station.slug}`;
        const text = `📻 ${station.name}\n\n🔗 Link: ${link}\n🔐 PIN: ${station.access_pin}`;

        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(station.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            alert(text);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Radio size={24} />
                            Gerenciar Estações
                        </h3>
                        <p className="text-sm text-indigo-100 mt-1">Configure rádios, slugs e PINs de acesso</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Add New */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-3">➕ Adicionar Nova Estação</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Nome *</label>
                                <input
                                    type="text"
                                    value={newStationName}
                                    onChange={e => handleNameChange(e.target.value)}
                                    placeholder="Ex: RB Campinas"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">Slug *</label>
                                <input
                                    type="text"
                                    value={newSlug}
                                    onChange={e => setNewSlug(e.target.value)}
                                    placeholder="rb-campinas"
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-600 font-medium mb-1 block">PIN *</label>
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        value={newPin}
                                        onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="1234"
                                        className="flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-mono"
                                    />
                                    <button
                                        onClick={generateRandomPin}
                                        className="px-3 py-2 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 text-xs font-bold"
                                    >
                                        Gerar
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddStation}
                            disabled={!newStationName.trim() || !newSlug.trim() || !newPin.trim()}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Criar Rádio
                        </button>
                    </div>

                    {/* List */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                            Estações Ativas <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{stations.length}</span>
                        </h4>

                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Carregando...</div>
                        ) : stations.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <Radio size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-gray-500">Nenhuma estação cadastrada.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {stations.map(station => (
                                    <div key={station.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                        {editingId === station.id ? (
                                            <div className="flex-1 grid grid-cols-3 gap-3 mr-4">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    placeholder="Nome"
                                                    className="px-2 py-1 border border-blue-300 rounded text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={editSlug}
                                                    onChange={e => setEditSlug(e.target.value)}
                                                    placeholder="slug"
                                                    className="px-2 py-1 border border-blue-300 rounded text-sm font-mono"
                                                />
                                                <input
                                                    type="text"
                                                    value={editPin}
                                                    onChange={e => setEditPin(e.target.value)}
                                                    placeholder="PIN"
                                                    className="px-2 py-1 border border-blue-300 rounded text-sm font-mono"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                                                    {station.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{station.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">/{station.slug}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Key size={14} className="text-gray-400" />
                                                    <span className="font-mono text-sm font-bold">
                                                        {showPins[station.id] ? station.access_pin : '••••'}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePinVisibility(station.id)}
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPins[station.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 ml-4">
                                            {editingId === station.id ? (
                                                <>
                                                    <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                                        <Save size={18} />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                                                        <X size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => copyAccessInfo(station)}
                                                        className={`p-2 rounded-lg ${copiedId === station.id ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                        title="Copiar Link + PIN"
                                                    >
                                                        {copiedId === station.id ? <Check size={18} /> : <Copy size={18} />}
                                                    </button>
                                                    <button onClick={() => startEditing(station)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteStation(station.id, station.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
