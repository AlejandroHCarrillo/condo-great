export interface CommunityConfiguration {
  id: string;
  communityId: string;
  communityName?: string | null;
  titulo: string;
  descripcion: string;
  valor: string;
  tipoDato: string;
  createdAt: string;
  updatedAt?: string | null;
  createdByUserId?: string | null;
  updatedByUserId?: string | null;
}

export interface CreateCommunityConfigurationDto {
  communityId: string;
  titulo: string;
  descripcion: string;
  valor: string;
  tipoDato: string;
  createdByUserId?: string | null;
}

export interface UpdateCommunityConfigurationDto {
  communityId: string;
  titulo: string;
  descripcion: string;
  valor: string;
  tipoDato: string;
  updatedByUserId?: string | null;
}
