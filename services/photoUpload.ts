import { supabase } from './supabase';
import type { PhotoType } from '../types';

/**
 * Upload de foto para auditoria de item do estoque central
 * @param file - Arquivo de imagem
 * @param masterInventoryId - ID do item do estoque central
 * @param photoType - Tipo da foto (receipt, product, package, other)
 * @returns URL pública da foto
 */
export async function uploadAuditPhoto(
    file: File,
    masterInventoryId: string,
    photoType: PhotoType = 'other'
): Promise<string> {
    try {
        // 1. Validar arquivo
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('Arquivo muito grande. Máximo 5MB.');
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WEBP.');
        }

        // 2. Gerar nome único
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const fileName = `${masterInventoryId}/${photoType}_${timestamp}_${randomStr}.${extension}`;

        // 3. Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audit-photos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) throw uploadError;

        // 4. Obter URL pública
        const { data: urlData } = supabase.storage
            .from('audit-photos')
            .getPublicUrl(uploadData.path);

        const photoUrl = urlData.publicUrl;

        // 5. Salvar registro no banco
        const { error: dbError } = await supabase
            .from('master_inventory_photos')
            .insert({
                master_inventory_id: masterInventoryId,
                photo_url: photoUrl,
                photo_type: photoType,
                // uploaded_by será preenchido quando implementarmos auth
            });

        if (dbError) {
            // Se falhar no banco, tentar deletar a foto do storage
            await supabase.storage.from('audit-photos').remove([uploadData.path]);
            throw dbError;
        }

        return photoUrl;
    } catch (error) {
        console.error('Erro ao fazer upload de foto:', error);
        throw error;
    }
}

/**
 * Deletar foto de auditoria
 * @param photoId - ID do registro de foto
 * @param photoUrl - URL da foto
 */
export async function deleteAuditPhoto(photoId: string, photoUrl: string): Promise<void> {
    try {
        // 1. Extrair path do storage da URL
        const urlParts = photoUrl.split('/audit-photos/');
        if (urlParts.length !== 2) {
            throw new Error('URL de foto inválida');
        }
        const filePath = urlParts[1];

        // 2. Deletar do storage
        const { error: storageError } = await supabase.storage
            .from('audit-photos')
            .remove([filePath]);

        if (storageError) throw storageError;

        // 3. Deletar do banco
        const { error: dbError } = await supabase
            .from('master_inventory_photos')
            .delete()
            .eq('id', photoId);

        if (dbError) throw dbError;
    } catch (error) {
        console.error('Erro ao deletar foto:', error);
        throw error;
    }
}

/**
 * Buscar todas as fotos de um item
 * @param masterInventoryId - ID do item
 * @returns Array de fotos
 */
export async function getItemPhotos(masterInventoryId: string) {
    const { data, error } = await supabase
        .from('master_inventory_photos')
        .select('*')
        .eq('master_inventory_id', masterInventoryId)
        .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
