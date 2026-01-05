export interface Banner {
  id: string;
  communityId?: string | null;
  communityName?: string | null;
  pathImagen: string;
  title: string;
  text: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
}

export interface CreateBannerRequest {
  communityId?: string | null;
  pathImagen: string;
  title: string;
  text: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateBannerRequest {
  communityId?: string | null;
  pathImagen: string;
  title: string;
  text: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

