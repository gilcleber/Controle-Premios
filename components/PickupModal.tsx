import React, { useState, useRef } from 'react';
import { Camera, Check, X } from 'lucide-react';

interface PickupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (photo: string | undefined) => void;
    winnerName: string;
    prizeName: string;
}

export const PickupModal: React.FC<PickupModalProps> = ({ isOpen, onClose, onConfirm, winnerName, prizeName }) => {
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-In">
                <div className="p-6 border-b border-gray-100 bg-green-50">
                    <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                        <Check size={20} /> Confirmar Entrega
                    </h3>
                    <p className="text-sm text-green-600 mt-1">
                        Confirmar entrega de <b>{prizeName}</b> para <b>{winnerName}</b>?
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto de Auditoria (Opcional)
                    </label>

                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {photo ? (
                            <div className="relative w-full h-48">
                                <img src={photo} alt="Preview" className="w-full h-full object-contain rounded-md" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPhoto(undefined); }}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400">
                                <Camera size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-sm font-medium text-gray-500">Toque para adicionar foto</p>
                                <p className="text-xs text-gray-400 mt-1">Câmera ou Arquivo</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <p className="text-xs text-center text-gray-400">
                        A foto será salva para auditoria. Não é obrigatória.
                    </p>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(photo)}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200 transition-all transform hover:scale-105"
                    >
                        Confirmar Baixa
                    </button>
                </div>
            </div>
        </div>
    );
};
