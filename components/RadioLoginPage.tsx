import React, { useState, useEffect } from 'react';
import { Radio, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { RadioStation } from '../types';

interface RadioLoginPageProps {
    slug: string;
    onLoginSuccess: (station: RadioStation) => void;
}

export const RadioLoginPage: React.FC<RadioLoginPageProps> = ({ slug, onLoginSuccess }) => {
    const [station, setStation] = useState<RadioStation | null>(null);
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        fetchStation();
    }, [slug]);

    const fetchStation = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error: fetchError } = await supabase
                .from('radio_stations')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (fetchError || !data) {
                setError('Rádio não encontrada. Verifique o link de acesso.');
                return;
            }

            setStation(data);
        } catch (err) {
            setError('Erro ao carregar informações da rádio.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!station || !pin.trim()) {
            setError('Digite o PIN de acesso.');
            return;
        }

        setValidating(true);
        setError('');

        try {
            // Validar PIN
            if (station.access_pin !== pin.trim()) {
                setError('PIN incorreto. Tente novamente.');
                setPin('');
                setValidating(false);
                return;
            }

            // Armazenar sessão no localStorage
            localStorage.setItem('currentRadio', JSON.stringify(station));
            localStorage.setItem('radioLoginTime', new Date().toISOString());

            // Sucesso!
            onLoginSuccess(station);
        } catch (err) {
            setError('Erro ao validar PIN.');
            setValidating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 shadow-2xl">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-600 mt-4">Carregando...</p>
                </div>
            </div>
        );
    }

    if (error && !station) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <p className="text-sm text-gray-500">
                        Entre em contato com o administrador para obter o link correto.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Radio size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {station?.name}
                    </h1>
                    <p className="text-gray-600">
                        Sistema de Gestão de Prêmios
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            PIN de Acesso
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Digite o PIN"
                                maxLength={10}
                                autoFocus
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-mono"
                            />
                            <Lock size={20} className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                        {error && (
                            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={validating || !pin.trim()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {validating ? 'Validando...' : 'Acessar Painel'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        🔒 Acesso seguro e exclusivo
                    </p>
                </div>
            </div>
        </div>
    );
};
