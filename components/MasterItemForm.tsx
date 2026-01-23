import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { supabase } from '../services/supabase';
import { PhotoUpload } from './PhotoUpload';
import type { MasterInventoryPhoto } from '../types';

interface MasterItemFormProps {
    onClose: () => void;
    onSaved: () => void;
}

export const MasterItemForm: React.FC<MasterItemFormProps> = ({ onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        item_name: '',
        description: '',
        category: '',
        supplier: '',
        total_quantity: 0,
        validity_date: '',
        notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [savedItemId, setSavedItemId] = useState<string | null>(null);
    const [photos, setPhotos] = useState<MasterInventoryPhoto[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { data, error } = await supabase
                .from('master_inventory')
                .insert({
                    ...formData,
                    available_quantity: formData.total_quantity, // Inicia com total disponível
                })
                .select()
                .single();

            if (error) throw error;

            setSavedItemId(data.id);
            // Não fechar para permitir upload de fotos
        } catch (error: any) {
            alert(`Erro ao salvar: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = () => {
        onSaved();
        onClose();
    };

    const categories = [
        'Ingresso',
        'Eletrônico',
        'Alimento',
        'Bebida',
        'Voucher',
        'Livro',
        'Brinquedo',
        'Outro'
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package size={20} className="text-indigo-600" />
                            Novo Item Recebido
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">Registre o item recebido do fornecedor</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {!savedItemId ? (
                        /* Formulário Principal */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Nome do Item *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.item_name}
                                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Ex: Ingresso Hopi Hari"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        rows={2}
                                        placeholder="Detalhes adicionais..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Categoria *
                                    </label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Fornecedor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Ex: Hopi Hari Promoções"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Quantidade Total *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.total_quantity || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, total_quantity: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Data de Validade
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.validity_date}
                                        onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Observações
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        rows={2}
                                        placeholder="Notas internas..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {saving ? 'Salvando...' : 'Salvar e Adicionar Fotos'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* Upload de Fotos */
                        <div className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">✅ Item salvo com sucesso!</p>
                                <p className="text-sm text-green-700 mt-1">
                                    Agora você pode adicionar fotos de auditoria (opcional).
                                </p>
                            </div>

                            <PhotoUpload
                                masterInventoryId={savedItemId}
                                existingPhotos={photos}
                                onPhotoUploaded={(url) => {
                                    // Recarregar fotos
                                    // TODO: Implementar getItemPhotos
                                }}
                            />

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={handleFinish}
                                    className="w-full py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-bold shadow-lg"
                                >
                                    Concluir
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
