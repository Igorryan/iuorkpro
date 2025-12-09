import { api } from '@config/api';

export interface BookingOffer {
  id: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  createdAt: string;
  scheduledAt: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  service: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    pricingType: 'FIXED' | 'HOURLY' | 'BUDGET';
  };
  client: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
}

export async function getPendingOffers(): Promise<BookingOffer[]> {
  try {
    const { data } = await api.get<BookingOffer[]>('/bookings/pending');
    return data;
  } catch (err) {
    console.error('Erro ao buscar ofertas pendentes:', err);
    return [];
  }
}

export async function acceptOffer(bookingId: string): Promise<BookingOffer> {
  try {
    const { data } = await api.put<BookingOffer>(`/bookings/${bookingId}/accept`);
    return data;
  } catch (err: any) {
    console.error('Erro ao aceitar oferta:', err);
    throw new Error(err?.response?.data?.message || 'Não foi possível aceitar a oferta');
  }
}

export async function rejectOffer(bookingId: string): Promise<BookingOffer> {
  try {
    const { data } = await api.put<BookingOffer>(`/bookings/${bookingId}/reject`);
    return data;
  } catch (err: any) {
    console.error('Erro ao recusar oferta:', err);
    throw new Error(err?.response?.data?.message || 'Não foi possível recusar a oferta');
  }
}

