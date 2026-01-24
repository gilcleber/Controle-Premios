import React from 'react';
import { X, TrendingUp, TrendingDown, Radio, Award } from 'lucide-react';

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    stations: any[];
    prizes: any[];
    outputs: any[];
}

export const PerformanceModal: React.FC<PerformanceModalProps> = ({
    isOpen,
    onClose,
    stations,
    prizes,
    outputs
}) => {
    if (!isOpen) return null;

    // Calcular métricas por estação
    const stationStats = stations.map(station => {
        const stationPrizes = prizes.filter(p => p.radio_station_id === station.id);
        const stationOutputs = outputs.filter(o => o.radio_station_id === station.id);

        const totalPrizes = stationPrizes.reduce((acc, p) => acc + p.totalQuantity, 0);
        const available = stationPrizes.reduce((acc, p) => acc + p.availableQuantity, 0);
        const distributed = totalPrizes - available;
        const delivered = stationOutputs.filter(o => o.status === 'DELIVERED').length;
        const pending = stationOutputs.filter(o => o.status === 'PENDING').length;

        return {
            station,
            totalPrizes,
            available,
            distributed,
            delivered,
            pending,
            deliveryRate: totalPrizes > 0 ? ((delivered / totalPrizes) * 100).toFixed(1) : '0'
        };
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">
                                {stations.length === 1 ? `Performance: ${stations[0].name}` : 'Performance da Rede'}
                            </h2>
                            <p className="text-indigo-100">
                                {stations.length === 1 ? 'Análise detalhada da estação' : 'Análise detalhada de todas as estações'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {stationStats.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Radio size={48} className="mx-auto mb-4 opacity-30" />
                            <p>Nenhuma estação cadastrada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stationStats.map(({ station, totalPrizes, available, distributed, delivered, pending, deliveryRate }) => (
                                <div key={station.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                                    {/* Header da Estação */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                {station.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{station.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono">ID: {station.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Award size={20} className="text-yellow-500" />
                                            <span className="text-2xl font-bold text-gray-900">{deliveryRate}%</span>
                                            <span className="text-xs text-gray-500">Taxa de Entrega</span>
                                        </div>
                                    </div>

                                    {/* Métricas */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Cadastrado</p>
                                            <p className="text-2xl font-bold text-gray-900">{totalPrizes}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Disponível</p>
                                            <p className="text-2xl font-bold text-blue-600">{available}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Distribuído</p>
                                            <p className="text-2xl font-bold text-orange-600">{distributed}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Entregues</p>
                                            <p className="text-2xl font-bold text-green-600 flex items-center gap-1">
                                                {delivered}
                                                <TrendingUp size={16} />
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Pendentes</p>
                                            <p className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                                                {pending}
                                                {pending > 5 && <TrendingDown size={16} className="text-red-500" />}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
