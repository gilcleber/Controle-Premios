import React from 'react';
import {
    Users, Gift, AlertTriangle, CheckCircle, TrendingUp, Activity,
    Calendar, Zap, Radio, Trophy, ArrowUpRight, ArrowDownRight, Package
} from 'lucide-react';
import { Prize, PrizeOutput, UserRole, RadioStation } from '../types';

interface DashboardProps {
    prizes: Prize[];
    outputs: PrizeOutput[];
    userRole: UserRole | null;
    selectedStationId: string | null;
    stations?: RadioStation[];
    onOpenPerformance?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
    prizes,
    outputs,
    userRole,
    selectedStationId,
    stations = [],
    onOpenPerformance
}) => {
    // Cálculos de Estatísticas
    const totalPrizes = prizes.reduce((acc, curr) => acc + curr.totalQuantity, 0);
    const availablePrizes = prizes.reduce((acc, curr) => acc + curr.availableQuantity, 0);

    // Prêmios entregues (status DELIVERED)
    const deliveredOutputs = outputs.filter(o => o.status === 'DELIVERED').length;

    // Prêmios pendentes (status PENDING)
    const pendingOutputs = outputs.filter(o => o.status === 'PENDING').length;

    // Prêmios próximos a vencer (30 dias)
    const today = new Date();
    const expiringPrizes = prizes.filter(p => {
        if (!p.validityDate) return false;
        const valDate = new Date(p.validityDate);
        const diffTime = valDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30 && p.availableQuantity > 0;
    });

    // Estação Atual
    const currentStationName = stations?.find(s => s.id === selectedStationId)?.name || 'Todas as Estações';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Debug Role: {userRole} */}
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                        Olá, {userRole === 'MASTER' ? 'Master' : userRole === 'ADMIN' ? 'Administrador' : 'Equipe'} 👋
                    </h1>
                    <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                        Visão geral dinâmica das operações da <span className="font-bold text-white">{currentStationName}</span>.
                    </p>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-500 opacity-20 rounded-full blur-3xl"></div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Disponíveis */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Disponíveis</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{availablePrizes}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Gift size={24} />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full mr-2">
                            <TrendingUp size={14} /> {(availablePrizes / (totalPrizes || 1) * 100).toFixed(0)}%
                        </span>
                        do total cadastrado
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                </div>

                {/* Card 2: Pendentes */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Retiradas Pendentes</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{pendingOutputs}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-orange-600 font-bold flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full mr-2">
                            <Activity size={14} /> Ação Necessária
                        </span>
                        na recepção
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                </div>

                {/* Card 3: Entregues */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Entregues</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{deliveredOutputs}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full mr-2">
                            <ArrowUpRight size={14} /> Sucesso
                        </span>
                        total histórico
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
                </div>

                {/* Card 4: Alertas */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">A Vencer (30d)</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{expiringPrizes.length}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <AlertTriangle size={24} />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full mr-2">
                            <Zap size={14} /> Atenção
                        </span>
                        itens críticos
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
                </div>
            </div>

            {/* Content Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Prêmios a Vencer */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-orange-500" />
                            Próximos Vencimentos
                        </h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">Ver Estoque</button>
                    </div>

                    <div className="flex-1 p-0">
                        {expiringPrizes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <CheckCircle size={48} className="mb-3 text-green-200" />
                                <p className="text-sm font-medium">Nenhum item vencendo em breve.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="p-4 pl-6">Item</th>
                                            <th className="p-4">Qtd.</th>
                                            <th className="p-4">Validade</th>
                                            <th className="p-4 text-right pr-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {expiringPrizes.slice(0, 5).map(prize => {
                                            const daysLeft = Math.ceil((new Date(prize.validityDate!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                            return (
                                                <tr key={prize.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="p-4 pl-6 font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{prize.name}</td>
                                                    <td className="p-4 text-gray-600">{prize.availableQuantity}</td>
                                                    <td className="p-4 text-sm">
                                                        <span className="flex items-center gap-1 text-orange-600 font-bold">
                                                            <Calendar size={14} />
                                                            {new Date(prize.validityDate!).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${daysLeft <= 7 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                                            }`}>
                                                            {daysLeft} dias
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Desempenho por Estação (Only Master) or Quick Actions (Admin) */}
                <div className="space-y-6">
                    {/* Master View - Stations Breakdown */}
                    {/* Master View - Stations Breakdown */}
                    {/* Master/Admin View - Stations Breakdown */}
                    {(userRole === 'MASTER' || userRole === 'ADMIN') && (
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-xl p-6 text-white text-center">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 mb-4 backdrop-blur-sm">
                                    <Radio size={24} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold">Performance da Rede</h3>
                                <p className="text-slate-400 text-sm mt-1">Status das estações ativas</p>
                            </div>

                            <div className="space-y-4">
                                {/* Exemplo estático ou dinâmico se props.stations estiver preenchido */}
                                {stations.length > 0 ? stations.slice(0, 3).map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
                                            <span className="font-medium text-sm">{s.name}</span>
                                        </div>
                                        <ArrowUpRight size={16} className="text-green-400" />
                                    </div>
                                )) : (
                                    <div className="p-4 text-slate-500 text-sm">Nenhuma estação configurada.</div>
                                )}
                            </div>

                            <button
                                onClick={onOpenPerformance}
                                className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/50"
                            >
                                Ver Relatório Completo
                            </button>
                        </div>
                    )}

                    {/* Quick Tips */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Zap size={18} className="text-blue-600" />
                            Dica Rápida
                        </h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Mantenha seu estoque sempre vistoriado. Prêmios sem foto tendem a ter menos saída. Adicione fotos reais para aumentar o engajamento dos ouvintes!
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
