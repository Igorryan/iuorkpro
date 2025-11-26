import { ChatMessage } from '@hooks/useChat';
import { Budget } from '@api/callbacks/budget';

export type ChatItemType = 'message' | 'budget';

export interface ChatItem {
  type: ChatItemType;
  id: string;
  timestamp: number;
  // Para mensagens
  message?: ChatMessage;
  // Para orçamento
  budget?: Budget;
}

/**
 * Mescla mensagens e orçamento em uma lista ordenada cronologicamente
 * O orçamento aparece na posição correta baseado em quando foi criado/atualizado
 */
export function mergeChatItems(
  messages: ChatMessage[],
  budget: Budget | null
): ChatItem[] {
  const items: ChatItem[] = [];

  // Adicionar mensagens
  messages.forEach((msg) => {
    items.push({
      type: 'message',
      id: msg.id,
      timestamp: msg.timestamp,
      message: msg,
    });
  });

  // Adicionar orçamento se existir e tiver preço definido
  // O timestamp do orçamento é baseado em quando o preço foi definido (updatedAt)
  // Se ainda não tem preço, usa createdAt
  if (budget) {
    // Se o preço foi definido (> 0), usar updatedAt (quando foi enviado)
    // Se ainda está pendente (preço = 0), usar createdAt (quando foi solicitado)
    const budgetTimestamp = parseFloat(budget.price) > 0
      ? new Date(budget.updatedAt).getTime()
      : new Date(budget.createdAt).getTime();

    items.push({
      type: 'budget',
      id: `budget-${budget.id}`,
      timestamp: budgetTimestamp,
      budget: budget,
    });
  }

  // Ordenar por timestamp (mais antigo primeiro)
  items.sort((a, b) => a.timestamp - b.timestamp);

  return items;
}

