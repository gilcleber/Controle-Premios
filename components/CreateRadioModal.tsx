import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface CreateRadioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export const CreateRadioModal: React.FC<CreateRadioModalProps> = ({ isOpen, onClose, onCreated }) => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [pin, setPin] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleNameChange = (value: string) => {
        setName(value);
        // Auto-gerar slug
        const autoSlug = value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '')    // Remove caracteres especiais
            .replace(/\s+/g, '-')            // Espaços viram hífens
            .replace(/-+/g, '-')             // Remove hífens duplicados
            .slice(0, 50);                   // Limita tamanho
        setSlug(autoSlug);
    };

    const generateRandomPin = () => {
        const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
        setPin(randomPin);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !slug.trim() || !pin.trim()) {
            setError('Preencha todos os campos');
            return;
        }

        if (pin.length < 4) {
            setError('PIN deve ter no mínimo 4 dígitos');
            return;
        }

        setSaving(true);

        try {
            const { data, error: insertError } = await supabase
                .from('radio_stations')
                .insert({
                    name: name.trim(),
                    slug: slug.trim(),
                    access_pin: pin.trim(),
                    is_active: true
                });

            if (insertError) {
                if (insertError.code === '23505') { // Unique violation
                    setError('Já existe uma rádio com este slug. Escolha outro.');
                } else {
                    setError('Erro ao criar rádio: ' + insertError.message);
                }
                setSaving(false);
                return;
            }

            // Sucesso!
            alert(`✅ Rádio "${name}" criada com sucesso!\n\nSlug: ${slug}\nPIN: ${pin}`);
            setName('');
            setSlug('');
            setPin('');
            onCreated();
            onClose();
        } catch (err: any) {
            setError('Erro inesperado: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Nova Rádio</h2>
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nome da Rádio *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Ex: RB Campinas"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Slug (URL) *
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="rb-campinas"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Será usado na URL: seu-site.com?radio={slug || 'slug'}
                        </p>
                    </div>

                    {/* PIN */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            PIN de Acesso *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                placeholder="1234"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-lg"
                            />
                            <button
                                type="button"
                                onClick={generateRandomPin}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                            >
                                Gerar
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Mínimo 4 dígitos</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                            <AlertCircle size={18} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !name || !slug || !pin}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
                        >
                            {saving ? 'Criando...' : (
                                <>
                                    <Plus size={18} />
                                    Criar Rádio
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
