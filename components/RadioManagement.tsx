import React, { useState, useEffect } from 'react';
import { Radio, Plus, Copy, Check, Settings, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { RadioStation } from '../types';

interface RadioManagementProps {
    onStationsUpdated: () => void;
}

export const RadioManagement: React.FC<RadioManagementProps> = ({ onStationsUpdated }) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('radio_stations')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (data) setStations(data);
        setLoading(false);
    };

    const generateAccessLink = (slug: string) => {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?radio=${slug}`;
    };

    const copyToClipboard = async (stationId: string, link: string, pin: string) => {
        const fullText = `🎙️ ACESSO À RÁDIO\n\nLink: ${link}\nPIN: ${pin}\n\n⚠️ Mantenha o PIN em segurança!`;

        try {
            await navigator.clipboard.writeText(fullText);
            setCopiedId(stationId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            alert('Erro ao copiar. Copie manualmente:\n\n' + fullText);
        }
    };

    const togglePinVisibility = (stationId: string) => {
        setShowPins(prev => ({ ...prev, [stationId]: !prev[stationId] }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Radio size={28} />
                            Gerenciamento de Rádios
                        </h3>
                        <p className="text-indigo-100">
                            Gerencie acessos e configure cada rádio da sua rede
                        </p>
                    </div>
                    <button
                        onClick={() => {/* TODO: abrir modal criar rádio */ }}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 flex items-center gap-2 font-bold transition-all shadow-lg"
                    >
                        <Plus size={18} />
                        Nova Rádio
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Rádios Ativas</p>
                    <p className="text-3xl font-bold text-gray-900">{stations.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total de Logins Hoje</p>
                    <p className="text-3xl font-bold text-blue-600">--</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Última Atividade</p>
                    <p className="text-lg font-bold text-gray-700">--</p>
                </div>
            </div>

            {/* Lista de Rádios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-xs uppercase text-gray-500 font-semibold">
                            <th className="p-4 text-left">Rádio</th>
                            <th className="p-4 text-left">Slug</th>
                            <th className="p-4 text-left">PIN de Acesso</th>
                            <th className="p-4 text-left">Link de Acesso</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Carregando...
                                </td>
                            </tr>
                        ) : stations.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Nenhuma rádio cadastrada.
                                </td>
                            </tr>
                        ) : (
                            stations.map(station => {
                                const link = generateAccessLink(station.slug);
                                const pin = station.access_pin || '----';
                                const isShowingPin = showPins[station.id];

                                return (
                                    <tr key={station.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {station.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{station.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{station.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-mono">
                                                /{station.slug}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-lg font-bold text-gray-900">
                                                    {isShowingPin ? pin : '••••'}
                                                </span>
                                                <button
                                                    onClick={() => togglePinVisibility(station.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                    title={isShowingPin ? 'Ocultar PIN' : 'Exibir PIN'}
                                                >
                                                    {isShowingPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={link}
                                                    readOnly
                                                    className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-gray-600"
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(station.id, link, pin)}
                                                    className={`p-2 rounded-lg transition-all ${copiedId === station.id
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    title="Copiar Link + PIN"
                                                >
                                                    {copiedId === station.id ? <Check size={16} /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Configurações"
                                            >
                                                <Settings size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    💡 <strong>Dica:</strong> Envie o link e o PIN para o gestor de cada rádio. Eles terão acesso apenas aos dados da própria emissora.
                </p>
            </div>
        </div>
    );
};
