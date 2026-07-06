import { api } from './axios';
import type { AdminParteRow, ParteDiario, Rol } from '../types';

export async function fetchAdminPartes(params?: Record<string, string | number | undefined>) {
  const { data } = await api.get('/partes', { params });
  return data.partes;
}

export async function fetchAdminParteRows(params?: Record<string, string | number | undefined>): Promise<{ rows: AdminParteRow[]; pagination: { limit: number; offset: number; nextOffset: number; hasMore: boolean } }> {
  const { data } = await api.get('/partes', { params });
  return data;
}

export async function fetchAdminParte(id: number): Promise<ParteDiario> {
  const { data } = await api.get(`/partes/${id}`);
  return data.parte;
}

export async function fetchAdminTrabajadores() {
  const { data } = await api.get('/trabajadores/admin/all');
  return data.trabajadores;
}

export async function createTrabajador(nombre: string) {
  const { data } = await api.post('/trabajadores', { nombre });
  return data.trabajador;
}

export async function updateTrabajador(id: number, nombre: string) {
  const { data } = await api.put(`/trabajadores/${id}`, { nombre });
  return data.trabajador;
}

export async function activateTrabajador(id: number) {
  const { data } = await api.patch(`/trabajadores/${id}/activate`);
  return data.trabajador;
}

export async function deactivateTrabajador(id: number) {
  const { data } = await api.patch(`/trabajadores/${id}/deactivate`);
  return data.trabajador;
}

export async function fetchAdminActividades() {
  const { data } = await api.get('/actividades/admin/all');
  return data.actividades;
}

export async function createActividad(nombre: string) {
  const { data } = await api.post('/actividades', { nombre });
  return data.actividad;
}

export async function updateActividad(id: number, nombre: string) {
  const { data } = await api.put(`/actividades/${id}`, { nombre });
  return data.actividad;
}

export async function activateActividad(id: number) {
  const { data } = await api.patch(`/actividades/${id}/activate`);
  return data.actividad;
}

export async function deactivateActividad(id: number) {
  const { data } = await api.patch(`/actividades/${id}/deactivate`);
  return data.actividad;
}

export async function fetchAdminPredios() {
  const { data } = await api.get('/predios/admin/all');
  return data.predios;
}

export async function createPredio(nombre: string) {
  const { data } = await api.post('/predios', { nombre });
  return data.predio;
}

export async function updatePredio(id: number, nombre: string) {
  const { data } = await api.put(`/predios/${id}`, { nombre });
  return data.predio;
}

export async function activatePredio(id: number) {
  const { data } = await api.patch(`/predios/${id}/activate`);
  return data.predio;
}

export async function deactivatePredio(id: number) {
  const { data } = await api.patch(`/predios/${id}/deactivate`);
  return data.predio;
}

export async function fetchUsers() {
  const { data } = await api.get('/users');
  return data.users;
}

export async function createUser(dataInput: { nombre: string; email: string; password: string; rol: Rol }) {
  const { data } = await api.post('/users', dataInput);
  return data.user;
}

export async function updateUser(id: number, dataInput: { nombre: string; email: string; password?: string; rol: Rol }) {
  const { data } = await api.put(`/users/${id}`, dataInput);
  return data.user;
}

export async function activateUser(id: number) {
  const { data } = await api.patch(`/users/${id}/activate`);
  return data.user;
}

export async function deactivateUser(id: number) {
  const { data } = await api.patch(`/users/${id}/deactivate`);
  return data.user;
}

export async function updateParte(id: number, payload: unknown) {
  const { data } = await api.put(`/partes/${id}`, payload);
  return data.parte;
}

export async function deleteParte(id: number) {
  const { data } = await api.delete(`/partes/${id}`);
  return data;
}

export async function exportPartesXlsx() {
  const response = await api.get('/export/partes.xlsx', { responseType: 'blob' });
  return response.data as Blob;
}

export async function syncGoogleSheets() {
  const { data } = await api.post('/google-sheets/sync');
  return data;
}
