
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
}

export interface Program {
  id: string;
  name: string;
  active: boolean;
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
}

export type TabView = 'DASHBOARD' | 'INVENTORY' | 'OUTPUTS' | 'PROGRAMS';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'RECEPTION';
