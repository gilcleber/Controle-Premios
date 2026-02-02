import React, { useState, useMemo } from 'react';
import { Prize, UserRole } from '../types';
import { Search, Filter, Grid, List, Plus, Folder, Package, Sliders, ChevronDown, ChevronRight, LayoutGrid, MoreVertical, Edit3, Trash2, Send, Radio, Trophy, Gift } from 'lucide-react';
import { DistributionModal } from './DistributionModal';

interface SortlyInventoryProps {
    prizes: Prize[];
    stations: any[];
    onEdit: (prize: Prize) => void;
    onDelete: (id: string) => void;
    onAddNew: () => void;
    onDataChange?: () => void;
    onToggleOnAir?: (prize: Prize) => void;
    onDraw?: (prize: Prize) => void;
    userRole?: UserRole | null;
    showSidebar?: boolean;
}

export const SortlyInventory: React.FC<SortlyInventoryProps> = ({ prizes, stations, onEdit, onDelete, onAddNew, onDataChange, onToggleOnAir, onDraw, userRole, showSidebar = true }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStationId, setActiveStationId] = useState<string | null>(null);
    const [activeQuickFilter, setActiveQuickFilter] = useState<'ALL' | 'ON_AIR' | 'NEW' | 'LOW_STOCK'>('ALL');

    // Distribution State
    const [distributionItem, setDistributionItem] = useState<Prize | null>(null);

    const filteredPrizes = useMemo(() => {
        let result = prizes;

        // 1. Filter by Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
        }

        // 2. Filter by Station (Folder)
        if (activeStationId === 'GENERAL') {
            result = result.filter(p => !p.radio_station_id);
        } else if (activeStationId) {
            result = result.filter(p => p.radio_station_id === activeStationId);
        }

        // 3. Filter by Quick Filters
        if (activeQuickFilter === 'ON_AIR') {
            result = result.filter(p => p.isOnAir);
        } else if (activeQuickFilter === 'LOW_STOCK') {
            result = result.filter(p => p.availableQuantity <= 5);
        } else if (activeQuickFilter === 'NEW') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            result = result.filter(p => new Date(p.entryDate) >= sevenDaysAgo);
        }

        return result;
    }, [prizes, searchQuery, activeStationId, activeQuickFilter]);

    const totalQuantity = filteredPrizes.reduce((acc, p) => acc + p.availableQuantity, 0);

    const handleDistributeSuccess = () => {
        setDistributionItem(null);
        if (onDataChange) onDataChange();
    };

    // Helper for Status Badge
    const StatusBadge = ({ prize }: { prize: Prize }) => {
        if (prize.availableQuantity === 0) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">Esgotado</span>;
        }
        if (prize.isOnAir) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>No Ar</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">Em Estoque</span>;
    };

    return (
        <div className="flex bg-gray-50/50 h-full min-h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-200 font-sans">
            {/* Sidebar Filters (Premium Style) */}
            {showSidebar && (
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-bold text-gray-800 text-lg tracking-tight">Categorias</h2>
                        <p className="text-xs text-gray-400 mt-1">Gerencie seu estoque por origem</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        <button
                            onClick={() => { setActiveStationId(null); setActiveQuickFilter('ALL'); }}
                            className={`w-full text-left text-sm px-3 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-all ${!activeStationId ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <LayoutGrid size={18} className={!activeStationId ? "text-gray-300" : "text-gray-400"} />
                            Todos os Itens
                        </button>

                        <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Estoques</div>

                        <button
                            onClick={() => { setActiveStationId('GENERAL'); setActiveQuickFilter('ALL'); }}
                            className={`w-full text-left text-sm px-3 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-all ${activeStationId === 'GENERAL' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Folder size={18} className={activeStationId === 'GENERAL' ? "fill-indigo-200 text-indigo-600" : "fill-gray-100 text-gray-400"} />
                            <span>Estoque Geral</span>
                            {/* Count Badge Example */}
                            <span className="ml-auto text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">
                                {prizes.filter(p => !p.radio_station_id).length}
                            </span>
                        </button>

                        <div className="space-y-0.5 pt-1">
                            {stations.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveStationId(s.id)}
                                    className={`w-full text-left text-sm px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all ${activeStationId === s.id ? 'bg-blue-50 text-blue-700 font-medium shadow-sm border border-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Folder size={16} className={`${activeStationId === s.id ? 'text-blue-500 fill-blue-200' : 'text-gray-400 fill-gray-100'}`} />
                                    <span className="truncate">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-50/30">
                {/* Header Toolbar - Premium Look (Hidden for Operator) */}
                {userRole !== 'OPERATOR' && (
                    <>
                        <div className="bg-white px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-sm">
                            <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                                <div className="relative w-full max-w-md group">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="O que você está procurando?"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder-gray-500 font-medium"
                                    />
                                </div>

                                {/* Filters Row */}
                                <div className="hidden lg:flex items-center gap-2">
                                    {[
                                        { id: 'ALL', label: 'Todos' },
                                        { id: 'ON_AIR', label: 'No Ar' },
                                        { id: 'NEW', label: 'Novos' },
                                        { id: 'LOW_STOCK', label: 'Baixo Estoque' }
                                    ].map(filter => (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActiveQuickFilter(filter.id as any)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${activeQuickFilter === filter.id
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <LayoutGrid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>

                                <button
                                    onClick={onAddNew}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <Plus size={18} /> <span className="hidden sm:inline">Novo Produto</span>
                                </button>
                            </div>
                        </div>

                        {/* KPI Bar - Clean Style */}
                        <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Package size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Total Estoque</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                    <Folder size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Itens Únicos</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredPrizes.length}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    {filteredPrizes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Package size={48} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium text-gray-500">Nenhum item encontrado</p>
                            <button onClick={() => { setActiveStationId(null); setActiveQuickFilter('ALL'); setSearchQuery(''); }} className="mt-2 text-blue-600 hover:underline text-sm font-medium">Limpar Filtros</button>
                            <span className="mt-4 text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded-full">System v2.3</span>
                        </div>
                    ) : (
                        viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPrizes.map(prize => (
                                    <div key={prize.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer hover:-translate-y-1" onClick={() => onEdit(prize)}>
                                        <div className="h-48 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                            {prize.photo_url ? (
                                                <img src={prize.photo_url} alt={prize.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <Package size={48} className="text-gray-200" />
                                            )}

                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => { e.stopPropagation(); onEdit(prize); }} className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 mx-1"><Edit3 size={16} /></button>
                                            </div>

                                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                                <StatusBadge prize={prize} />
                                                {/* On Air Toggle for Admin */}
                                                {userRole === 'ADMIN' && onToggleOnAir && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onToggleOnAir(prize); }}
                                                        className={`p-1.5 rounded-full shadow-sm border transition-all ${prize.isOnAir ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-400 hover:text-blue-600'}`}
                                                        title={prize.isOnAir ? "Remover do Ar" : "Colocar no Ar"}
                                                    >
                                                        <Radio size={14} className={prize.isOnAir ? "animate-pulse" : ""} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-800 text-lg leading-tight truncate flex-1" title={prize.name}>{prize.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{prize.description || 'Sem descrição.'}</p>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-400 font-bold uppercase">Quantidade</p>
                                                    <p className="text-lg font-bold text-gray-900">{prize.availableQuantity}</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* COMBO DETAILS FOR GRID VIEW */}
                                                    {prize.comboDetails && prize.comboDetails.length > 0 && (
                                                        <div className="hidden sm:flex flex-col items-end mr-2">
                                                            <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 mb-1">
                                                                <Plus size={8} /> Item Extra
                                                            </span>
                                                            {prize.comboDetails.map((detail, idx) => (
                                                                <span key={idx} className="text-xs font-medium text-gray-600 truncate max-w-[100px]" title={detail.name}>
                                                                    + {detail.quantity} {detail.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Register Output Button (Operator) */}
                                                    {onDraw && (userRole === 'OPERATOR' || userRole === 'RECEPTION' || userRole === 'ADMIN') && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDraw(prize); }}
                                                            disabled={prize.availableQuantity === 0}
                                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                                                            title="Registrar Ganhador"
                                                        >
                                                            <Trophy size={14} /> Registrar
                                                        </button>
                                                    )}

                                                    {((activeStationId === 'GENERAL' && userRole === 'MASTER') || userRole === 'ADMIN') && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDistributionItem(prize); }}
                                                            className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                                            title={userRole === 'ADMIN' ? "Separar Quantidade (Criar Lote)" : "Distribuir para Rádio"}
                                                        >
                                                            <Send size={14} /> {userRole === 'ADMIN' ? 'Separar' : 'Distribuir'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="p-5 pl-8 text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Origem</th>
                                            <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Qtd.</th>
                                            <th className="p-5 text-right pr-8 text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPrizes.map(prize => (
                                            <tr key={prize.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => onEdit(prize)}>
                                                <td className="p-4 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                                                            {prize.photo_url ? (
                                                                <img src={prize.photo_url} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{prize.name}</p>
                                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{prize.description}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                                        <Folder size={12} />
                                                        {stations.find(s => s.id === prize.radio_station_id)?.name || 'Geral'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <StatusBadge prize={prize} />
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-mono font-bold ${prize.availableQuantity === 0 ? 'text-red-500' : 'text-gray-900'}`}>{prize.availableQuantity}</span>
                                                </td>
                                                <td className="p-4 pr-8 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {onDraw && (userRole === 'OPERATOR' || userRole === 'RECEPTION' || userRole === 'ADMIN') && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDraw(prize); }}
                                                                disabled={prize.availableQuantity === 0}
                                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors shadow-sm"
                                                                title="Registrar Ganhador"
                                                            >
                                                                <Trophy size={16} />
                                                            </button>
                                                        )}

                                                        {activeStationId === 'GENERAL' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setDistributionItem(prize); }}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="Distribuir"
                                                            >
                                                                <Send size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onEdit(prize); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete(prize.id); }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>

            {
                distributionItem && (
                    <DistributionModal
                        item={distributionItem}
                        onClose={() => setDistributionItem(null)}
                        onDistributed={handleDistributeSuccess}
                        userRole={userRole}
                    />
                )
            }
        </div >
    );
};
