import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@config/api';
import type { IAddress } from '../types/address';

export type Address = IAddress;

const ADDRESS_KEY = '@pro_address';
const HISTORY_STORAGE_KEY = '@pro_address_history';
const LEGACY_ADDRESS_KEY = '@address';
const LEGACY_HISTORY_KEY = '@address_history';
const MAX_HISTORY_ITEMS = 8;

export async function getUserAddress() {
  // Migração simples: se a nova chave não existir mas a antiga existir, migra
  const [current, legacy] = await Promise.all([
    AsyncStorage.getItem(ADDRESS_KEY),
    AsyncStorage.getItem(LEGACY_ADDRESS_KEY),
  ]);
  if (!current && legacy) {
    await AsyncStorage.setItem(ADDRESS_KEY, legacy);
    // não apaga a legacy para não interferir no outro app
  }
  const value = current || legacy;
  return value != null ? (JSON.parse(value) as Address) : undefined;
}

export async function setUserAddress(address: Address) {
  await AsyncStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
  try {
    await api.put('/professionals/me/address', {
      latitude: address.latitude,
      longitude: address.longitude,
      street: address.street,
      number: address.number,
      district: address.district,
      city: address.city,
      state: address.state,
      postalcode: address.postalcode,
    });
  } catch (e) {
    // Silencia erro de rede aqui para não bloquear UX local, mas poderia logar
  }
}

export async function getAddressHistory(): Promise<Address[]> {
  // Migração simples do histórico
  const [current, legacy] = await Promise.all([
    AsyncStorage.getItem(HISTORY_STORAGE_KEY),
    AsyncStorage.getItem(LEGACY_HISTORY_KEY),
  ]);
  if (!current && legacy) {
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, legacy);
  }
  const value = current || legacy;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Address[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addAddressToHistory(address: Address): Promise<void> {
  const history = await getAddressHistory();
  const withoutDuplication = history.filter(
    (item) =>
      !(
        item.latitude === address.latitude &&
        item.longitude === address.longitude &&
        item.street === address.street &&
        item.number === address.number &&
        item.city === address.city
      ),
  );
  const updated = [address, ...withoutDuplication].slice(0, MAX_HISTORY_ITEMS);
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}


