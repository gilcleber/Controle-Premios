import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Package, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { MasterInventory, RadioStation } from '../types';

interface MasterInventoryListProps {
    onAddNew: () => void;
    onDistribute: (item: MasterInventory) => void;
    onViewPhotos: (item: MasterInventory) => void;
}

export const MasterInventoryList: React.FC<MasterInventoryListProps> = ({
    onAddNew,
    onDistribute,
    onViewPhotos,
}) => {
    const [items, setItems] = useState<MasterInventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('master_inventory')
                .select('*')
                .order('receipt_date', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter((item) => {
        const q = search.toLowerCase();
        return (
            item.item_name.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            item.supplier?.toLowerCase().includes(q)
        );
    });

    const isExpiringSoon = (validityDate?: string) => {
        if (!validityDate) return false;
        const validity = new Date(validityDate);
        const today = new Date();
        const diffDays = Math.ceil((validity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    };

    const isExpired = (validityDate?: string) => {
        if (!validityDate) return false;
        return new Date(validityDate) < new Date();
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Package size={28} className="text-indigo-600" />
                        Estoque Central Master
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Controle de todos os itens recebidos de fornecedores</p>
                </div>
                <button
                    onClick={onAddNew}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-bold shadow-lg"
                >
                    <Plus size={18} />
                    Novo Item Recebido
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <Search size={20} className="text-gray-400 ml-2" />
                <input
                    type="text"
                    placeholder="Buscar por nome, categoria ou fornecedor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400"
                />
                {search && (
                    <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Itens</p>
                    <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Disponíveis</p>
                    <p className="text-2xl font-bold text-green-600">
                        {items.filter((i) => i.available_quantity > 0).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Vencendo</p>
                    <p className="text-2xl font-bold text-orange-600">
                        {items.filter((i) => isExpiringSoon(i.validity_date)).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold">Vencidos</p>
                    <p className="text-2xl font-bold text-red-600">
                        {items.filter((i) => isExpired(i.validity_date)).length}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="p-4">Item</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4">Fornecedor</th>
                                <th className="p-4 text-center">Estoque</th>
                                <th className="p-4">Recebimento</th>
                                <th className="p-4">Validade</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        Nenhum item encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold text-gray-900">{item.item_name}</div>
                                            {item.description && (
                                                <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                                {item.category || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700">{item.supplier || '-'}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className={`text-lg font-bold ${item.available_quantity > 0 ? 'text-green-600' : 'text-gray-400'
                                                        }`}
                                                >
                                                    {item.available_quantity}
                                                </span>
                                                <span className="text-xs text-gray-400">de {item.total_quantity}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(item.receipt_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {item.validity_date ? (
                                                <div
                                                    className={`text-sm ${isExpired(item.validity_date)
                                                            ? 'text-red-600 font-bold'
                                                            : isExpiringSoon(item.validity_date)
                                                                ? 'text-orange-600 font-medium'
                                                                : 'text-gray-600'
                                                        }`}
                                                >
                                                    {new Date(item.validity_date).toLocaleDateString()}
                                                    {isExpiringSoon(item.validity_date) && (
                                                        <AlertTriangle size={12} className="inline ml-1" />
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onViewPhotos(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                                    title="Ver Fotos"
                                                >
                                                    📸
                                                </button>
                                                <button
                                                    onClick={() => onDistribute(item)}
                                                    disabled={item.available_quantity === 0}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                                    title="Distribuir"
                                                >
                                                    <ArrowRight size={14} />
                                                    Distribuir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
