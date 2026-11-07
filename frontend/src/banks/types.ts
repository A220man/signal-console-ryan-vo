export interface BankConfig {
  retain_chunk_size: number;
  enable_auto_consolidation: boolean;
  consolidation_threshold: number;
}

export interface Bank {
  id: number;
  name: string;
  description: string | null;
  config: BankConfig;
  created_at: string;
  updated_at: string;
}

export interface BankListResponse {
  items: Bank[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BankCreateRequest {
  name: string;
  description?: string;
  config?: BankConfig;
}

export interface BankUpdateRequest {
  name?: string;
  description?: string;
  config?: BankConfig;
}

export interface PaginationParams {
  page: number;
  page_size: number;
  name?: string;
}
export interface AuditLog {
  id: number;
  bank_id: number;
  bank_name: string;
  action: string;
  changes: string | null;
  user_id: string | null;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
