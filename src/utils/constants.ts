import type { Organization } from "src/types/campaigns"

// id: sigue mandando el int 1 (ADMIN_ORG_ID) en el header X-Organization-Id -- el
// backend lo acepta como fallback numérico (ver _resolve_org_id en
// app/core/security.py). Lo que identifica esta organización especial en el
// resto del frontend ya no es el id sino is_system (ver Organization en
// src/types/campaigns.ts).
export const SUPERUSER: Organization = { id: "1", name: "Panel Global", is_system: true }

export const DEFAULT_LEAD_PAGE_SIZE = 15
