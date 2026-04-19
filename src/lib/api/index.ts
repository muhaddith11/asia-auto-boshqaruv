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
  const res = await fetch(`${API_BASE}/clients`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createClient(data: Partial<Mijoz>) {
  const res = await fetch(`${API_BASE}/clients`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateClient(id: number | string, data: Partial<Mijoz>) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { 
    method: 'POST', 
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteClient(id: number | string) {
  const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getOrders(): Promise<Buyurtma[]> {
  const res = await fetch(`${API_BASE}/orders`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createOrder(data: Partial<Buyurtma>) {
  const res = await fetch(`${API_BASE}/orders`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateOrder(id: number | string, data: Partial<Buyurtma>) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { 
    method: 'POST', 
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteOrder(id: number | string) {
  const res = await fetch(`${API_BASE}/orders/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getWorkers(): Promise<Xodim[]> {
  const res = await fetch(`${API_BASE}/workers`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createWorker(data: Partial<Xodim>) {
  const res = await fetch(`${API_BASE}/workers`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export const updateWorker = (id: number | string, w: Partial<Xodim>) => 
  fetch(`${API_BASE}/workers/${id}`, { 
    method: 'POST', // Use POST for stability
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(w) 
  }).then(handleJson);

export async function deleteWorker(id: number | string) {
  const res = await fetch(`${API_BASE}/workers/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getParts(): Promise<Zapchast[]> {
  const res = await fetch(`${API_BASE}/parts`, { cache: 'no-store' });
  return handleJson(res);
}

export async function getCars(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/cars`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createPart(data: Partial<Zapchast>) {
  const res = await fetch(`${API_BASE}/parts`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updatePart(id: number | string, data: Partial<Zapchast>) {
  const res = await fetch(`${API_BASE}/parts/${id}`, { 
    method: 'POST', // Use POST for stability
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deletePart(id: number | string) {
  const res = await fetch(`${API_BASE}/parts/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getReports() {
  const res = await fetch(`${API_BASE}/reports`, { cache: 'no-store' });
  return handleJson(res);
}

export async function getServices(carModel?: string): Promise<any[]> {
  const url = carModel ? `${API_BASE}/services?car_model=${encodeURIComponent(carModel)}` : `${API_BASE}/services`;
  const res = await fetch(url, { cache: 'no-store' });
  return handleJson(res);
}

export async function createService(data: any) {
  const res = await fetch(`${API_BASE}/services`, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  return handleJson(res);
}

export async function updateService(id: string | number, data: any) {
  const res = await fetch(`${API_BASE}/services/${id}`, { 
    method: 'POST', // Use POST for stability
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return handleJson(res);
}

export async function deleteService(id: string | number) {
  const res = await fetch(`${API_BASE}/services/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

// Financial Endpoints
export async function getKassa() {
  const res = await fetch(`${API_BASE}/kassa`, { cache: 'no-store' });
  return handleJson(res);
}

export async function updateKassaState(data: { naqd: number; karta: number }) {
  const res = await fetch(`${API_BASE}/kassa`, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    headers: { 'Content-Type': 'application/json' } 
  });
  return handleJson(res);
}

export async function getOperations() {
  const res = await fetch(`${API_BASE}/operations`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createOperation(data: any) {
  const res = await fetch(`${API_BASE}/operations`, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    headers: { 'Content-Type': 'application/json' } 
  });
  return handleJson(res);
}

export async function deleteOperation(id: string | number) {
  const res = await fetch(`${API_BASE}/operations/${id}`, { method: 'DELETE' });
  return handleJson(res);
}

export async function getSalaries() {
  const res = await fetch(`${API_BASE}/salaries`, { cache: 'no-store' });
  return handleJson(res);
}

export async function createSalary(data: any) {
  const res = await fetch(`${API_BASE}/salaries`, { 
    method: 'POST', 
    body: JSON.stringify(data), 
    headers: { 'Content-Type': 'application/json' } 
  });
  return handleJson(res);
}
