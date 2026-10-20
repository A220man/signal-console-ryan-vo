import type {
  Bank,
  BankListResponse,
  BankCreateRequest,
  BankUpdateRequest,
  PaginationParams,
} from './types';

const API_BASE = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const banksApi = {
  async list(params: PaginationParams): Promise<BankListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('page', params.page.toString());
    searchParams.set('page_size', params.page_size.toString());
    if (params.name) searchParams.set('name', params.name);
    
    return fetchJson<BankListResponse>(`${API_BASE}/banks?${searchParams.toString()}`);
  },
  
  async get(id: number): Promise<Bank> {
    return fetchJson<Bank>(`${API_BASE}/banks/${id}`);
  },
  
  async create(data: BankCreateRequest): Promise<Bank> {
    return fetchJson<Bank>(`${API_BASE}/banks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async update(id: number, data: BankUpdateRequest): Promise<Bank> {
    return fetchJson<Bank>(`${API_BASE}/banks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  async delete(id: number): Promise<void> {
    await fetch(`${API_BASE}/banks/${id}`, { method: 'DELETE' });
  },
};