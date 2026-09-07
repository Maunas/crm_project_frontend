import type { Organization } from "src/types/campaigns"

// id: sigue mandando 1 (ADMIN_ORG_ID) en el header X-Organization-Id.
// Lo que identifica esta organización especial es is_system (ver Organization en
// src/types/campaigns.ts).
export const SUPERUSER: Organization = { id: "1", name: "Panel Global", is_system: true }

export const DEFAULT_LEAD_PAGE_SIZE = 15

export const CRM_TITLE = "CRM"