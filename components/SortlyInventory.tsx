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
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-700">Filters</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* Folder Filter (Stations) */}
                    <div>
                        <button
                            onClick={() => setFoldersExpanded(!foldersExpanded)}
                            className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        >
                            <span className="font-semibold flex items-center gap-2">
                                {foldersExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                Folders (Stations)
                            </span>
                        </button>

                        {foldersExpanded && (
                            <div className="ml-4 pl-2 border-l border-gray-100 mt-1 space-y-1">
                                <button className="w-full text-left text-xs px-2 py-1.5 rounded text-blue-600 bg-blue-50 font-medium flex items-center gap-2">
                                    <Folder size={12} /> All Folders
                                </button>
                                {stations.map(s => (
                                    <button key={s.id} className="w-full text-left text-xs px-2 py-1.5 rounded text-gray-600 hover:bg-gray-50 flex items-center gap-2 truncate">
                                        <Folder size={12} className="text-gray-400" /> {s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="mt-4">
                        <button
                            onClick={() => setStatusExpanded(!statusExpanded)}
                            className="w-full flex items-center justify-between p-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                        >
                            <span className="font-semibold flex items-center gap-2">
                                {statusExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                Status
                            </span>
                        </button>

                        {statusExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                                <label className="flex items-center gap-2 text-xs text-gray-600 p-1 cursor-pointer">
                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                                    Low Stock
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-600 p-1 cursor-pointer">
                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                                    No Air (Active)
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-600 p-1 cursor-pointer">
                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                                    Expired
                                </label>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-slate-50">
                {/* Header Toolbar */}
                <div className="bg-white p-4 border-b border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <h2 className="text-xl font-bold text-slate-800">All Items</h2>
                        <div className="relative flex-1 md:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search all items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggles */}
                        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <button
                            onClick={onAddNew}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-md shadow-red-200 flex items-center gap-2 transition-all transform hover:scale-105"
                        >
                            <Plus size={18} /> ADD ITEM
                        </button>
                    </div>
                </div>

                {/* Summary Bar */}
                <div className="px-6 py-3 flex gap-6 text-xs font-medium text-gray-500 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
                    <span>Items: <strong className="text-gray-800">{filteredPrizes.length}</strong></span>
                    <span>Total Quantity: <strong className="text-gray-800">{totalQuantity} units</strong></span>
                    {/* <span>Total Value: <strong className="text-gray-800">R$ --</strong></span> */}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPrizes.map(prize => (
                                <div key={prize.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => onEdit(prize)}>
                                    {/* Image Placeholder (Sortly style big image) */}
                                    <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                        <Package size={48} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />

                                        {/* Status Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {prize.isOnAir && (
                                                <span className="bg-green-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">ON AIR</span>
                                            )}
                                            {prize.availableQuantity === 0 && (
                                                <span className="bg-red-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm">OUT</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate" title={prize.name}>{prize.name}</h3>
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[2.5em]">{prize.description || 'No description'}</p>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 uppercase font-semibold">Quantity</span>
                                                <span className={`font-bold text-xl ${prize.availableQuantity > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                                                    {prize.availableQuantity}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 font-medium`}>
                                                    {stations.find(s => s.id === prize.radio_station_id)?.name || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // List View implementation (Table simplified)
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="p-4">Item</th>
                                        <th className="p-4">Folder</th>
                                        <th className="p-4 text-center">Qty</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPrizes.map(prize => (
                                        <tr key={prize.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onEdit(prize)}>
                                            <td className="p-4 font-medium text-gray-800">{prize.name}</td>
                                            <td className="p-4 text-gray-600 text-sm">{stations.find(s => s.id === prize.radio_station_id)?.name}</td>
                                            <td className="p-4 text-center font-bold text-gray-700">{prize.availableQuantity}</td>
                                            <td className="p-4">
                                                {prize.isOnAir ? <span className="text-green-600 text-xs font-bold">ON AIR</span> : <span className="text-gray-400 text-xs">OFF</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                            </td>
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
