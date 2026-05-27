import { api } from './axios';
import type { Actividad, Predio, Trabajador } from '../types';

export async function fetchTrabajadores(): Promise<Trabajador[]> {
  const { data } = await api.get('/trabajadores');
  return data.trabajadores;
}

export async function fetchActividades(): Promise<Actividad[]> {
  const { data } = await api.get('/actividades');
  return data.actividades;
}

export async function fetchPredios(): Promise<Predio[]> {
  const { data } = await api.get('/predios');
  return data.predios;
}
