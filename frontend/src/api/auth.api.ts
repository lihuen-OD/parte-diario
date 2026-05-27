import { api } from './axios';

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data;
}
