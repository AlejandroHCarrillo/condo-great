export interface CommunityPrice {
  id: string;
  communityId: string;
  communityName?: string | null;
  concepto: string;
  monto: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}

export interface CreateCommunityPriceDto {
  communityId: string;
  concepto: string;
  monto: number;
  isActive: boolean;
  createdByUserId?: string | null;
}

export interface UpdateCommunityPriceDto {
  communityId: string;
  concepto: string;
  monto: number;
  isActive: boolean;
  updatedByUserId?: string | null;
}
