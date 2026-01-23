import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, FileText, Package, AlertCircle } from 'lucide-react';
import { uploadAuditPhoto, deleteAuditPhoto } from '../services/photoUpload';
import type { PhotoType, MasterInventoryPhoto } from '../types';

interface PhotoUploadProps {
    masterInventoryId: string;
    existingPhotos?: MasterInventoryPhoto[];
    onPhotoUploaded?: (photoUrl: string) => void;
    onPhotoDeleted?: (photoId: string) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
    masterInventoryId,
    existingPhotos = [],
    onPhotoUploaded,
    onPhotoDeleted,
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = useCallback(
        async (files: FileList | null, photoType: PhotoType) => {
            if (!files || files.length === 0) return;

            setError(null);
            const fileArray = Array.from(files);

            for (const file of fileArray) {
                const key = `${photoType}_${Date.now()}`;
                setUploadProgress((prev) => ({ ...prev, [key]: true }));

                try {
                    const photoUrl = await uploadAuditPhoto(file, masterInventoryId, photoType);
                    onPhotoUploaded?.(photoUrl);
                } catch (err: any) {
                    setError(err.message || 'Erro ao fazer upload');
                } finally {
                    setUploadProgress((prev) => {
                        const newProgress = { ...prev };
                        delete newProgress[key];
                        return newProgress;
                    });
                }
            }
        },
        [masterInventoryId, onPhotoUploaded]
    );

    const handleDelete = async (photo: MasterInventoryPhoto) => {
        if (!confirm('Tem certeza que deseja deletar esta foto?')) return;

        try {
            await deleteAuditPhoto(photo.id, photo.photo_url);
            onPhotoDeleted?.(photo.id);
        } catch (err: any) {
            setError(err.message || 'Erro ao deletar foto');
        }
    };

    const isUploading = Object.keys(uploadProgress).length > 0;

    const photoTypeConfig: Record<PhotoType, { label: string; icon: typeof FileText; color: string }> = {
        receipt: { label: '📄 Nota Fiscal', icon: FileText, color: 'blue' },
        product: { label: '📦 Produto', icon: ImageIcon, color: 'purple' },
        package: { label: '📸 Embalagem', icon: Package, color: 'green' },
        other: { label: '🖼️ Outras', icon: ImageIcon, color: 'gray' },
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ImageIcon size={20} className="text-blue-600" />
                Fotos de Auditoria
            </h3>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Upload Zones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['receipt', 'product', 'package'] as PhotoType[]).map((type) => {
                    const config = photoTypeConfig[type];
                    const Icon = config.icon;

                    return (
                        <label
                            key={type}
                            className={`
                relative cursor-pointer border-2 border-dashed rounded-lg p-4 
                hover:border-${config.color}-400 hover:bg-${config.color}-50 
                transition-all text-center
                ${uploadProgress[type] ? 'opacity-50 pointer-events-none' : ''}
              `}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files, type)}
                                disabled={isUploading}
                            />
                            <div className="flex flex-col items-center gap-2">
                                <Icon size={32} className={`text-${config.color}-500`} />
                                <span className="text-sm font-bold text-gray-700">{config.label}</span>
                                <span className="text-xs text-gray-500">Clique ou arraste</span>
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Photo Grid */}
            {existingPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {existingPhotos.map((photo) => (
                        <div key={photo.id} className="relative group">
                            <img
                                src={photo.photo_url}
                                alt={photo.photo_type || 'Foto'}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(photo)}
                                    className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                {photoTypeConfig[photo.photo_type || 'other'].label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {isUploading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                    Fazendo upload...
                </div>
            )}
        </div>
    );
};
