
// ========================================
// NEW: Multi-Tenant Types
// ========================================

export interface RadioStation {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
  access_pin?: string;
  created_at: string;
  updated_at: string;
}

export interface MasterInventory {
  id: string;
  item_name: string;
  description?: string;
  category?: string;
  supplier?: string;
  total_quantity: number;
  available_quantity: number;
  receipt_date: string;
  validity_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PhotoType = 'receipt' | 'product' | 'package' | 'other';

export interface MasterInventoryPhoto {
  id: string;
  master_inventory_id: string;
  photo_url: string;
  photo_type?: PhotoType;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface DistributionHistory {
  id: string;
  master_inventory_id: string;
  radio_station_id: string;
  prize_id?: string;
  quantity_distributed: number;
  distributed_by?: string;
  distributed_at: string;
  notes?: string;
}

// ========================================
// UPDATED: Existing Types
// ========================================

export interface Prize {
  id: string;
  name: string;
  description: string;
  totalQuantity: number;
  availableQuantity: number;
  entryDate: string; // ISO Date
  validityDate: string; // ISO Date - Validade do produto
  maxDrawDate: string; // ISO Date - Prazo máximo para sortear
  pickupDeadlineDays: number; // Dias úteis para retirada
  isOnAir?: boolean; // Se true, aparece na tela do locutor
  comboDetails?: { prizeId: string, quantity: number }[]; // Detalhes do combo para evitar duplo débito

  // NEW: Multi-tenant fields
  radio_station_id?: string; // Estação à qual pertence
  source_master_id?: string; // Item do estoque central de origem
}

export interface Program {
  id: string;
  name: string;
  active: boolean;

  // NEW: Multi-tenant field
  radio_station_id?: string;
}

export type OutputType = 'DRAW' | 'GIFT'; // Sorteio vs Brinde/Diretoria

export interface PrizeOutput {
  id: string;
  prizeId: string;
  prizeName: string;
  quantity: number;
  note: string; // Ex: "Promoção Blitz", "Sorteio Insta"
  programId?: string; // ID do programa (opcional para manter compatibilidade)
  programName?: string; // Nome do programa (para exibição fácil)
  type: OutputType;
  date: string; // ISO Date (Data da saída)
  pickupDeadline: string; // ISO Date (Calculado com dias úteis)
  status: 'PENDING' | 'DELIVERED'; // Aguardando retirada vs Entregue (Baixa definitiva)
  deliveredDate?: string;

  // Winner Details
  winnerName: string;
  winnerPhone: string;
  winnerEmail?: string;
  winnerDoc?: string; // CPF/RG
  winnerAddress?: string;

  // NEW: Multi-tenant field
  radio_station_id?: string;
}

export type TabView = 'DASHBOARD' | 'INVENTORY' | 'OUTPUTS' | 'PROGRAMS' | 'MASTER_INVENTORY';

export type UserRole = 'MASTER' | 'ADMIN' | 'OPERATOR' | 'RECEPTION';

