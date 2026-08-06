import type { Creator } from "./shared";

export interface SystemAuditLog {
  id: string; // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  organization_id: number | null;
  entity_type: string;
  // uuid real de la entidad auditada (antes exponía el id interno) -- ver
  // backend/AGENTS.md §18-ter.
  entity_id: string;
  action: string;
  changes: Record<string, unknown> | null;
  created_at: string;
  created_by: number | null;
  creator: Creator | null;
}