import React from 'react';
import { PrizeOutput, UserRole } from '../types';
import { User, FileText, Phone, MapPin, AlertOctagon, CheckCircle, Clock, Eye, MessageCircle, CalendarPlus, Edit2, Trash2 } from 'lucide-react';
import { PickupModal } from './PickupModal';

interface OutputListProps {
  winners: PrizeOutput[];
  role: UserRole;
  onConfirmPickup: (outputId: string, photo?: string) => void;
  onEdit: (output: PrizeOutput) => void;
  onDelete: (outputId: string) => void;
  onExtendDeadline?: (outputId: string) => void;
  onView?: (output: PrizeOutput) => void;
}

export const WinnerList: React.FC<OutputListProps> = ({ winners, role, onConfirmPickup, onEdit, onDelete, onExtendDeadline, onView }) => {
  const isAdmin = role === 'ADMIN';
  const isReception = role === 'RECEPTION';
  const [confirmingOutput, setConfirmingOutput] = React.useState<PrizeOutput | null>(null);

  const handleConfirmClick = (output: PrizeOutput) => {
    setConfirmingOutput(output);
  };

  const handleModalConfirm = (photo?: string) => {
    if (confirmingOutput) {
      onConfirmPickup(confirmingOutput.id, photo);
      setConfirmingOutput(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                <th className="p-4">Ganhador</th>
                <th className="p-4">Evento / Prêmio</th>
                <th className="p-4">Contatos</th>
                <th className="p-4">Prazos</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {winners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhuma saída registrada ainda.
                  </td>
                </tr>
              ) : (
                winners.map((output) => {
                  const isLate = output.status === 'PENDING' && new Date(output.pickupDeadline) < new Date();

                  return (
                    <tr key={output.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
                            <User size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{output.winnerName || 'Não Informado'}</div>
                            {output.winnerDoc && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FileText size={10} /> {output.winnerDoc}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-gray-800">{output.quantity > 1 ? `${output.quantity}x ` : ''}{output.prizeName}</div>
                        <div className="text-xs text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">
                          {output.quantity}x • {output.note || 'Saída Avulsa'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {output.winnerPhone && (
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <Phone size={12} className="text-green-600" /> {output.winnerPhone}
                            </div>
                          )}
                          {output.winnerAddress && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[150px]" title={output.winnerAddress}>
                              <MapPin size={12} className="text-orange-500" /> {output.winnerAddress}
                            </div>
                          )}
                          {output.winnerEmail && (
                            <div className="text-xs text-gray-400 truncate max-w-[150px]">{output.winnerEmail}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-600 space-y-1">
                        <div>Ganhou: {(() => {
                          try { return output.date ? new Date(output.date).toLocaleDateString() : 'data inválida'; } catch (e) { return 'data inválida'; }
                        })()}</div>
                        <div className={isLate ? 'text-red-600 font-bold' : ''}>
                          Limite: {(() => {
                            try { return output.pickupDeadline ? new Date(output.pickupDeadline).toLocaleDateString() : 's/ prazo'; } catch (e) { return 'data inválida'; }
                          })()}
                        </div>
                      </td>
                      <td className="p-4">
                        {output.status === 'DELIVERED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} /> Entregue
                          </span>
                        ) : isLate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertOctagon size={12} /> Expirado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock size={12} /> Aguardando
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Reception: View Details */}
                          {isReception && onView && (
                            <button
                              onClick={() => onView(output)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Ver Detalhes"
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {/* Recepção e Admin podem confirmar entrega */}
                          {(isAdmin || isReception) && output.status === 'PENDING' && !isLate && (
                            <button
                              onClick={() => handleConfirmClick(output)}
                              className="mr-2 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
                            >
                              Entregar
                            </button>
                          )}

                          {/* Se estiver expirado e for Recepção, mostra botão do WhatsApp */}
                          {isReception && isLate && output.status === 'PENDING' && (
                            <a
                              href={`https://wa.me/5519999999999?text=Olá, o ouvinte ${output.winnerName} veio retirar o prêmio ${output.prizeName} mas está vencido (Limite: ${(() => { try { return new Date(output.pickupDeadline).toLocaleDateString(); } catch { return '???'; } })()}). Pode liberar?`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mr-2 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                            >
                              <MessageCircle size={12} /> Chamar Gestor
                            </a>
                          )}

                          {/* Admin pode estender prazo de itens vencidos */}
                          {isAdmin && isLate && onExtendDeadline && (
                            <button
                              onClick={() => onExtendDeadline(output.id)}
                              className="mr-2 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded hover:bg-amber-200 transition-colors shadow-sm whitespace-nowrap flex items-center gap-1"
                            >
                              <CalendarPlus size={12} /> Estender
                            </button>
                          )}

                          {/* Apenas Admin pode editar ou excluir */}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => onEdit(output)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Editar Informações"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => onDelete(output.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Excluir Saída"
                              >
                                <Trash2 size={16} />
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
      </div >

      {confirmingOutput && (
        <PickupModal
          isOpen={!!confirmingOutput}
          onClose={() => setConfirmingOutput(null)}
          onConfirm={handleModalConfirm}
          winnerName={confirmingOutput.winnerName}
          prizeName={confirmingOutput.prizeName}
        />
      )}
    </>
  );
};
