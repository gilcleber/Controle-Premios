import React, { useState } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { RadioStation } from '../types';

interface EditStationModalProps {
    station: RadioStation;
    onClose: () => void;
    onSaved: () => void;
}

export const EditStationModal: React.FC<EditStationModalProps> = ({
    station,
    onClose,
    onSaved,
}) => {
    const [name, setName] = useState(station.name);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Nome não pode estar vazio!');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('radio_stations')
                .update({ name: name.trim() })
                .eq('id', station.id);

            if (error) throw error;

            alert('Estação atualizada com sucesso!');
            onSaved();
            window.location.reload(); // Forçar recarregamento para garantir que o nome atualize no topo
            onClose();
        } catch (error: any) {
            alert(`Erro ao atualizar: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Edit2 size={20} className="text-blue-600" />
                            Editar Estação
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{station.slug}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Nome da Estação *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ex: Rádio Educadora FM"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este nome será exibido em todos os dropdowns e relatórios
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
