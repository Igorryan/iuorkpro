import { api } from '@config/api';

export interface Budget {
  id: string;
  chatId: string;
  serviceId: string;
  price: string;
  description: string | null;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface CreateBudgetParams {
  chatId: string;
  serviceId: string;
  price: number;
  description?: string;
}

/**
 * Criar orçamento
 */
export async function createBudget(params: CreateBudgetParams): Promise<Budget | null> {
  try {
    const { data } = await api.post<Budget>('/api/budgets', params);
    return data;
  } catch (err) {
    console.error('Error creating budget:', err);
    return null;
  }
}

/**
 * Buscar orçamentos de um chat
 */
export async function getChatBudgets(chatId: string, status?: string): Promise<Budget[]> {
  try {
    const params = status ? { status } : {};
    const { data } = await api.get<Budget[]>(`/api/chats/${chatId}/budgets`, { params });
    return data;
  } catch (err) {
    console.error('Error fetching budgets:', err);
    return [];
  }
}

/**
 * Aceitar orçamento
 */
export async function acceptBudget(budgetId: string): Promise<Budget | null> {
  try {
    const { data } = await api.patch<Budget>(`/api/budgets/${budgetId}/accept`);
    return data;
  } catch (err) {
    console.error('Error accepting budget:', err);
    return null;
  }
}

/**
 * Rejeitar orçamento
 */
export async function rejectBudget(budgetId: string): Promise<Budget | null> {
  try {
    const { data } = await api.patch<Budget>(`/api/budgets/${budgetId}/reject`);
    return data;
  } catch (err) {
    console.error('Error rejecting budget:', err);
    return null;
  }
}

