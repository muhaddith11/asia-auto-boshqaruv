import { Mijoz, Buyurtma, Xodim, Zapchast } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api';

async function handleJson(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API error: ${res.status}`);
  }
  return res.json();
}

export async function getClients(): Promise<Mijoz[]> {
  const res = await fetch(`${API_BASE}/clients`);
  return handleJson(res);
}

export async function createClient(data: Partial<Mijoz>) {
  const res = await fetch(`${API_BASE}/clients`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateClient(id: number | string, data: Partial<Mijoz>) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return handleJson(res);
}

export async function deleteClient(id: number | string) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getOrders(): Promise<Buyurtma[]> {
  const res = await fetch(`${API_BASE}/orders`);
  return handleJson(res);
}

export async function createOrder(data: Partial<Buyurtma>) {
  const res = await fetch(`${API_BASE}/orders`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateOrder(id: number | string, data: Partial<Buyurtma>) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return handleJson(res);
}

export async function deleteOrder(id: number | string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getWorkers(): Promise<Xodim[]> {
  const res = await fetch(`${API_BASE}/workers`);
  return handleJson(res);
}

export async function createWorker(data: Partial<Xodim>) {
  const res = await fetch(`${API_BASE}/workers`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateWorker(id: number | string, data: Partial<Xodim>) {
  const res = await fetch(`${API_BASE}/workers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return handleJson(res);
}

export async function deleteWorker(id: number | string) {
  const res = await fetch(`${API_BASE}/workers/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getParts(): Promise<Zapchast[]> {
  const res = await fetch(`${API_BASE}/parts`);
  return handleJson(res);
}

export async function createPart(data: Partial<Zapchast>) {
  const res = await fetch(`${API_BASE}/parts`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updatePart(id: number | string, data: Partial<Zapchast>) {
  const res = await fetch(`${API_BASE}/parts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return handleJson(res);
}

export async function deletePart(id: number | string) {
  const res = await fetch(`${API_BASE}/parts/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getReports() {
  const res = await fetch(`${API_BASE}/reports`);
  return handleJson(res);
}
