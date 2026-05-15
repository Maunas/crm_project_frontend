import type { Creator, Updater } from "./shared";

export interface SystemAuditLog{
  id: number;
  organization_id: number | null;
  entity_type: string;
  entity_id: number;
  action: string;
  changes: Record<string, any> | null;
  created_at: string;
  created_by: number | null;
  creator: Creator | null;
}