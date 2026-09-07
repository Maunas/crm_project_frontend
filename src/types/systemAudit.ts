import type { Creator } from "./shared";

export interface SystemAuditLog {
  id: string;
  organization_id: number | null;
  entity_type: string;
  // uuid real de la entidad auditada (no el id interno).
  entity_id: string;
  action: string;
  changes: Record<string, unknown> | null;
  created_at: string;
  created_by: number | null;
  creator: Creator | null;
}