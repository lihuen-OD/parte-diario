import { api } from './axios';
import type { ParteDiario } from '../types';

export async function fetchMisPartes(): Promise<ParteDiario[]> {
  const { data } = await api.get('/partes/mis');
  return data.partes;
}

export async function fetchPartes(): Promise<ParteDiario[]> {
  const { data } = await api.get('/partes');
  return data.partes;
}

export async function createParte(payload: unknown) {
  const { data } = await api.post('/partes', payload);
  return data.parte;
}

export async function updateParte(id: number, payload: unknown) {
  const { data } = await api.put(`/partes/${id}`, payload);
  return data.parte;
}

export async function deleteParte(id: number) {
  const { data } = await api.delete(`/partes/${id}`);
  return data;
}
