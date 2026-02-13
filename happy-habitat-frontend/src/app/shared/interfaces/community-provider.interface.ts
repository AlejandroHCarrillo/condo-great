export interface CommunityProvider {
  id: string;
  communityId?: string | null;
  communityName?: string | null;
  businessName: string;
  taxId?: string | null;
  fullAddress?: string | null;
  contactPhones?: string | null;
  primaryEmail?: string | null;
  websiteOrSocialMedia?: string | null;
  primaryContactName?: string | null;
  directPhone?: string | null;
  mobilePhone?: string | null;
  contactEmail?: string | null;
  productsOrServices?: string | null;
  categoryOrIndustry?: string | null;
  paymentMethods?: string | null;
  rating?: number | null;
  orderHistory?: string | null;
  pastIncidentsOrClaims?: string | null;
  internalNotes?: string | null;
  isActive: boolean;
  createdAt: string;
  createdByUserId?: string | null;
  updatedAt?: string | null;
  updatedByUserId?: string | null;
}

export interface CreateCommunityProviderDto {
  communityId: string;
  businessName: string;
  taxId?: string | null;
  fullAddress?: string | null;
  contactPhones?: string | null;
  primaryEmail?: string | null;
  websiteOrSocialMedia?: string | null;
  primaryContactName?: string | null;
  directPhone?: string | null;
  mobilePhone?: string | null;
  contactEmail?: string | null;
  productsOrServices?: string | null;
  categoryOrIndustry?: string | null;
  paymentMethods?: string | null;
  rating?: number | null;
  orderHistory?: string | null;
  pastIncidentsOrClaims?: string | null;
  internalNotes?: string | null;
  createdByUserId?: string | null;
}

export interface UpdateCommunityProviderDto {
  communityId: string;
  businessName: string;
  taxId?: string | null;
  fullAddress?: string | null;
  contactPhones?: string | null;
  primaryEmail?: string | null;
  websiteOrSocialMedia?: string | null;
  primaryContactName?: string | null;
  directPhone?: string | null;
  mobilePhone?: string | null;
  contactEmail?: string | null;
  productsOrServices?: string | null;
  categoryOrIndustry?: string | null;
  paymentMethods?: string | null;
  rating?: number | null;
  orderHistory?: string | null;
  pastIncidentsOrClaims?: string | null;
  internalNotes?: string | null;
  updatedByUserId?: string | null;
}
