// Componente Dropdown de seleção de estação
import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import type { RadioStation } from '../types';

interface StationSelectorProps {
    selectedStationId: string | null;
    onStationChange: (stationId: string | null) => void;
    userRole: 'MASTER' | 'ADMIN' | 'OPERATOR' | 'RECEPTION';
}

export const StationSelector: React.FC<StationSelectorProps> = ({
    selectedStationId,
    onStationChange,
    userRole,
}) => {
    const [stations, setStations] = useState<RadioStation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        try {
            const { data, error } = await supabase
                .from('radio_stations')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setStations(data || []);
        } catch (error) {
            console.error('Erro ao buscar estações:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apenas MASTER e ADMIN podem trocar de estação
    if (userRole !== 'MASTER' && userRole !== 'ADMIN') {
        return null;
    }

    const selectedStation = stations.find((s) => s.id === selectedStationId);

    return (
        <div className="flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            <select
                value={selectedStationId || ''}
                onChange={(e) => onStationChange(e.target.value || null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                disabled={loading}
            >
                <option value="">Todas as Estações</option>
                {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                        {station.name}
                    </option>
                ))}
            </select>
            {selectedStation && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {selectedStation.name}
                </span>
            )}
        </div>
    );
};
