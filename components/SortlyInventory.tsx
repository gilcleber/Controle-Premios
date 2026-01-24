import React, { useState, useMemo } from 'react';
import { Prize } from '../types';
import { Search, Filter, Grid, List, Plus, Folder, Package, Sliders, ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';

interface SortlyInventoryProps {
    prizes: Prize[];
    stations: any[];
    onEdit: (prize: Prize) => void;
    onDelete: (id: string) => void;
    onAddNew: () => void;
}

export const SortlyInventory: React.FC<SortlyInventoryProps> = ({ prizes, stations, onEdit, onDelete, onAddNew }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    // Filter Mock States (Expanded/Collapsed)
    const [foldersExpanded, setFoldersExpanded] = useState(true);
    const [statusExpanded, setStatusExpanded] = useState(true);

    const filteredPrizes = useMemo(() => {
        let result = prizes;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
        }
        // Add more filter logic here
        return result;
    }, [prizes, searchQuery]);

    const totalQuantity = filteredPrizes.reduce((acc, p) => acc + p.availableQuantity, 0);
    const estimatedValue = filteredPrizes.length * 100; // Fake value for design match

    return (
        <div className="flex bg-gray-50 h-full min-h-[600px] rounded-xl overflow-hidden shadow-sm border border-gray-100 font-sans">
            {/* Sidebar Filters (Sortly Style) */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
                <div className="p-4 flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-lg">Início</span>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    {/* Folder Tree */}
                    <div className="space-y-0.5">
                        <button
                            className="w-full text-left text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700 font-medium flex items-center gap-3 border border-red-100"
                        >
                            <Folder size={18} className="fill-red-200" /> Todos os Prêmios
                        </button>

                        <div className="pl-4 pt-1 space-y-0.5">
                            {stations.map(s => (
                                <button key={s.id} className="w-full text-left text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition-colors group">
                                    <Folder size={16} className="text-gray-400 group-hover:text-gray-500 fill-gray-100" />
                                    <span className="truncate">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags Section Mock */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Filtros Rápidos</p>
                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-sm text-gray-600 px-3 py-1 cursor-pointer hover:bg-gray-50 rounded">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div> No Ar (Ativos)
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 px-3 py-1 cursor-pointer hover:bg-gray-50 rounded">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Novos Itens
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 px-3 py-1 cursor-pointer hover:bg-gray-50 rounded">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div> Estoque Baixo
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Header Toolbar */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                        <div className="relative w-full max-w-xl">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar prêmios, estações..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:bg-white transition-all placeholder-gray-500"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg" title="Configurar Colunas">
                            <Sliders size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center text-sm text-gray-500 mr-2 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                            Ordenar: <span className="font-semibold text-gray-700 ml-1">Nome</span>
                        </div>

                        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Visualizar Grade"
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
                                title="Visualizar Lista"
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            onClick={onAddNew}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-all hover:shadow-red-200"
                        >
                            <Plus size={18} /> NOVO ITEM
                        </button>
                    </div>
                </div>

                {/* KPI Bar */}
                <div className="px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total em Estoque</p>
                        <p className="text-3xl font-bold text-gray-800">{totalQuantity} <span className="text-sm font-normal text-gray-500">unid.</span></p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Itens Cadastrados</p>
                        <p className="text-3xl font-bold text-gray-800">{filteredPrizes.length}</p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPrizes.map(prize => (
                                <div key={prize.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer hover:-translate-y-1" onClick={() => onEdit(prize)}>
                                    {/* Image Placeholder or Actual Photo */}
                                    <div className="h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                                        {prize.photo_url ? (
                                            <img src={prize.photo_url} alt={prize.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <Package size={56} className="text-gray-300 group-hover:scale-110 transition-transform duration-500 group-hover:text-red-200" />
                                        )}

                                        {/* Status Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                                            {prize.isOnAir && (
                                                <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold tracking-wide">NO AR</span>
                                            )}
                                            {prize.availableQuantity === 0 && (
                                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold tracking-wide">ESGOTADO</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate" title={prize.name}>{prize.name}</h3>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Qtd.</span>
                                                <span className={`font-bold text-xl ${prize.availableQuantity > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                                                    {prize.availableQuantity}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">Estação</span>
                                                <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium truncate max-w-[100px]`}>
                                                    {stations.find(s => s.id === prize.radio_station_id)?.name || 'Geral'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // List View implementation (Table simplified)
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4 pl-6">Nome do Item</th>
                                        <th className="p-4">Pasta / Estação</th>
                                        <th className="p-4 text-center">Qtd.</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right pr-6">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPrizes.map(prize => (
                                        <tr key={prize.id} className="hover:bg-red-50/10 cursor-pointer transition-colors" onClick={() => onEdit(prize)}>
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                        {prize.photo_url ? (
                                                            <img src={prize.photo_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={18} />
                                                        )}
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{prize.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm flex items-center gap-2">
                                                <Folder size={14} className="text-gray-300" />
                                                {stations.find(s => s.id === prize.radio_station_id)?.name || 'Geral'}
                                            </td>
                                            <td className="p-4 text-center font-bold text-gray-700">{prize.availableQuantity}</td>
                                            <td className="p-4">
                                                {prize.isOnAir ?
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Ativo
                                                    </span>
                                                    :
                                                    <span className="text-gray-400 text-xs">Inativo</span>
                                                }
                                            </td>
                                            <td className="p-4 text-right pr-6 text-gray-400 text-sm">--</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
