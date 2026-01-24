
import React from 'react';
import { Prize, UserRole } from '../types';
import { Edit2, Trash2, Trophy, AlertTriangle, Calendar, FileText, Gift, Radio, Eye, EyeOff } from 'lucide-react';

interface PrizeListProps {
  prizes: Prize[];
  role: UserRole;
  onEdit: (prize: Prize) => void;
  onDelete: (id: string) => void;
  onDraw: (prize: Prize) => void;
  onGenerateScript: (prize: Prize) => void;
  onToggleOnAir?: (prize: Prize) => void;
  stations?: any[]; // Lista de estações para lookup
  showStationName?: boolean; // Flag para mostrar coluna
}

export const PrizeList: React.FC<PrizeListProps> = ({ prizes, role, onEdit, onDelete, onDraw, onGenerateScript, onToggleOnAir, stations = [], showStationName = false }) => {
  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isAdmin = role === 'ADMIN';
  const isOperator = role === 'OPERATOR';

  // --- Operator View: CARDS ONLY (Filtered by isOnAir) ---
  if (isOperator) {
    // ... (omitted for brevity, keep existing logic if possible by using replace chunk carefully)
    // Actually, I can keep the same logic. Let's start replacement from line 24 if I want to skip imports, but interface changed.
    // I will replace the whole top part.
    const availablePrizes = prizes.filter(p => {
      const expiredDraw = isExpired(p.maxDrawDate);
      const expiredValidity = isExpired(p.validityDate);
      const hasStock = p.availableQuantity > 0;
      // CRITICAL: Operator ONLY sees items marked as On Air
      return hasStock && !expiredDraw && !expiredValidity && p.isOnAir;
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {availablePrizes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            <Radio size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-center">Nenhum prêmio disponível para sorteio neste momento.</p>
            <p className="text-sm text-center opacity-70">Aguarde o administrador liberar os itens.</p>
          </div>
        ) : (
          availablePrizes.map(prize => (
            <div key={prize.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="h-2 bg-indigo-500 w-full animate-pulse"></div>
              <div className="p-6">
                {/* Operator Header - Show Station if needed */}
                {showStationName && (
                  <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                      {stations?.find(s => s.id === prize.radio_station_id)?.name}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg">
                    <Gift size={24} />
                  </div>

                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight min-h-[3.5rem]">
                  {prize.availableQuantity} {prize.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                  {prize.description || 'Sem descrição adicional.'}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => onGenerateScript(prize)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <FileText size={18} /> Ver Roteiro
                  </button>
                  <button
                    onClick={() => onDraw(prize)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
                  >
                    <Trophy size={20} /> REGISTRAR GANHADOR
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // --- Admin View: TABLE ---
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
              <th className="p-4">No Ar?</th>
              {showStationName && <th className="p-4">Emissora</th>}
              <th className="p-4">Prêmio</th>
              <th className="p-4 text-center">Estoque</th>
              <th className="p-4">Datas Críticas</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prizes.length === 0 ? (
              <tr>
                <td colSpan={showStationName ? 6 : 5} className="p-8 text-center text-gray-500">
                  Nenhum prêmio cadastrado.
                </td>
              </tr>
            ) : (
              prizes.map((prize) => {
                const expiredDraw = isExpired(prize.maxDrawDate);
                const expiredValidity = isExpired(prize.validityDate);
                const hasStock = prize.availableQuantity > 0;

                return (
                  <tr key={prize.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {isAdmin && onToggleOnAir && (
                        <button
                          onClick={() => onToggleOnAir(prize)}
                          className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all ${prize.isOnAir ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={prize.isOnAir ? "Visível para Locutor" : "Oculto do Locutor"}
                        >
                          {prize.isOnAir ? <Radio size={20} className="animate-pulse" /> : <Radio size={20} />}
                          <span className="text-[10px] font-bold">{prize.isOnAir ? 'NO AR' : 'OFF'}</span>
                        </button>
                      )}
                    </td>
                    {showStationName && (
                      <td className="p-4">
                        <span className="inline-block bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded shadow-sm font-medium">
                          {stations?.find(s => s.id === prize.radio_station_id)?.name || 'N/A'}
                        </span>
                      </td>
                    )}
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{prize.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{prize.description}</div>
                      {expiredValidity && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                          <AlertTriangle size={10} /> Validade Vencida
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-bold ${hasStock ? 'text-green-600' : 'text-gray-400'}`}>
                          {prize.availableQuantity}
                        </span>
                        <span className="text-xs text-gray-400">de {prize.totalQuantity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-2" title="Validade">
                          <Calendar size={12} className="text-blue-400" />
                          <span className={expiredValidity ? 'text-red-500 font-medium' : ''}>
                            Val: {new Date(prize.validityDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2" title="Prazo Máximo Sorteio">
                          <Calendar size={12} className="text-orange-400" />
                          <span className={expiredDraw ? 'text-red-500 font-medium' : ''}>
                            Max Sorteio: {new Date(prize.maxDrawDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Operações de Rádio (Sorteio/Roteiro) - Apenas para Operador/Recepção ou se estiver em modo rádio e não for gestão global */}
                        {/* Usuário solicitou remoção do Master/Admin pois "é da rádio" */}
                        {(role !== 'MASTER' && role !== 'ADMIN') && (
                          <>
                            <button
                              onClick={() => onGenerateScript(prize)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Gerar Texto Locutor"
                            >
                              <FileText size={18} />
                            </button>

                            <button
                              onClick={() => onDraw(prize)}
                              disabled={!hasStock || expiredDraw || expiredValidity}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Registrar Ganhador"
                            >
                              <Trophy size={18} />
                            </button>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(prize)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => onDelete(prize.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
