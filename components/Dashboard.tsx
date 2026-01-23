import React, { useMemo } from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle, Clock, BarChart3, Radio } from 'lucide-react';
import type { Prize, PrizeOutput, UserRole, RadioStation } from '../types';

interface DashboardProps {
    prizes: Prize[];
    outputs: PrizeOutput[];
    userRole: UserRole;
    selectedStationId: string | null;
    stations: RadioStation[];
}

export const Dashboard: React.FC<DashboardProps> = ({
    prizes,
    outputs,
    userRole,
    selectedStationId,
    stations,
}) => {
    const stats = useMemo(() => {
        const totalPrizes = prizes.reduce((sum, p) => sum + p.availableQuantity, 0);
        const totalDistributed = outputs.filter(o => o.status === 'DELIVERED').length;
        const pending = outputs.filter(o => o.status === 'PENDING').length;

        const today = new Date();
        const expiringSoon = prizes.filter(p => {
            if (!p.validityDate) return false;
            const validity = new Date(p.validityDate);
            const diffDays = Math.ceil((validity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 30;
        });

        const expired = prizes.filter(p => {
            if (!p.validityDate) return false;
            return new Date(p.validityDate) < today;
        });

        return {
            totalPrizes,
            totalTypes: prizes.length,
            totalDistributed,
            pending,
            expiringSoon: expiringSoon.length,
            expired: expired.length,
            expiringSoonList: expiringSoon,
        };
    }, [prizes, outputs]);

    const stationStats = useMemo(() => {
        if (userRole !== 'MASTER') return [];

        return stations.map(station => {
            const stationPrizes = prizes.filter(p => p.radio_station_id === station.id);
            const stationOutputs = outputs.filter(o => o.radio_station_id === station.id);

            return {
                station,
                totalPrizes: stationPrizes.reduce((sum, p) => sum + p.availableQuantity, 0),
                totalTypes: stationPrizes.length,
                distributed: stationOutputs.filter(o => o.status === 'DELIVERED').length,
                pending: stationOutputs.filter(o => o.status === 'PENDING').length,
            };
        });
    }, [prizes, outputs, stations, userRole]);

    const selectedStationName = stations.find(s => s.id === selectedStationId)?.name || 'Todas as Estações';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">
                        {userRole === 'MASTER' ? 'Visão Geral do Grupo' : `Dashboard - ${selectedStationName}`}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Resumo executivo do sistema de prêmios
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total em Estoque */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Itens em Estoque</p>
                            <p className="text-4xl font-bold">{stats.totalPrizes}</p>
                            <p className="text-blue-100 text-xs mt-2">{stats.totalTypes} tipos diferentes</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <Package size={28} />
                        </div>
                    </div>
                </div>

                {/* Distribuídos */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Prêmios Entregues</p>
                            <p className="text-4xl font-bold">{stats.totalDistributed}</p>
                            <p className="text-green-100 text-xs mt-2">Total distribuído</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <CheckCircle size={28} />
                        </div>
                    </div>
                </div>

                {/* Aguardando */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">Aguardando Retirada</p>
                            <p className="text-4xl font-bold">{stats.pending}</p>
                            <p className="text-orange-100 text-xs mt-2">Ganhadores registrados</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <Clock size={28} />
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium mb-1">Atenção Necessária</p>
                            <p className="text-4xl font-bold">{stats.expiringSoon + stats.expired}</p>
                            <p className="text-red-100 text-xs mt-2">{stats.expiringSoon} vencendo, {stats.expired} vencidos</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                            <AlertTriangle size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* MASTER: Visão por Estação */}
            {userRole === 'MASTER' && stationStats.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Radio size={20} className="text-indigo-600" />
                        <h4 className="text-lg font-bold text-gray-800">Distribuição por Estação</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stationStats.map(({ station, totalPrizes, totalTypes, distributed, pending }) => (
                            <div key={station.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all">
                                <h5 className="font-bold text-gray-800 mb-3">{station.name}</h5>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Em estoque:</span>
                                        <span className="font-bold text-blue-600">{totalPrizes} itens</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipos:</span>
                                        <span className="font-medium text-gray-800">{totalTypes}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Entregues:</span>
                                        <span className="font-medium text-green-600">{distributed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Pendentes:</span>
                                        <span className="font-medium text-orange-600">{pending}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Próximos a Vencer */}
            {stats.expiringSoonList.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={20} className="text-orange-600" />
                        <h4 className="text-lg font-bold text-gray-800">Próximos a Vencer</h4>
                        <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold">
                            {stats.expiringSoonList.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {stats.expiringSoonList.slice(0, 5).map(prize => {
                            const validity = new Date(prize.validityDate);
                            const diffDays = Math.ceil((validity.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                            return (
                                <div key={prize.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div>
                                        <p className="font-semibold text-gray-800">{prize.name}</p>
                                        <p className="text-xs text-gray-500">Vence: {validity.toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${diffDays <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                                            {diffDays} {diffDays === 1 ? 'dia' : 'dias'}
                                        </span>
                                        <p className="text-xs text-gray-500">{prize.availableQuantity} unidades</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
