import type { Metadata } from "./shared";

export interface NomenclatorPost {
  name: string | null;
  // Reemplaza al viejo parent_nomenclator_id único: un catálogo puede tener varios padres válidos (M2M).
  // public_uuid de cada Nomenclator padre (Fase 3, ya resuelto en el backend).
  parent_nomenclator_ids?: string[];
}

export interface Nomenclator extends Omit<NomenclatorPost, "parent_nomenclator_ids"> {
  id: string; // public_uuid desde Fase 3, ver backend/AGENTS.md §18
  organization_id: number | null;
  parent_nomenclators: Nomenclator[];
}

export interface NomenclatorDetailed extends Nomenclator, Metadata {
  child_nomenclators: Nomenclator[];
}

export interface NomenclatorItemPost {
  value: string | null;
  // public_uuid de Nomenclator (Fase 3, ya resuelto en el backend).
  nomenclator_id: string | null;
  // Reemplaza al viejo parent_item_id único: un ítem puede tener varios ítems padre (uno por cada catálogo padre válido).
  // public_uuid de cada NomenclatorItem padre.
  parent_item_ids?: string[];
}
export interface NomenclatorItem extends Omit<NomenclatorItemPost, "parent_item_ids" | "nomenclator_id"> {
  id: string; // public_uuid desde Fase 3
  organization_id: number | null;
  nomenclator_id: number | null; // FK embebida: sigue siendo el id interno viejo (sin migrar)
  parent_items: NomenclatorItem[]
  // Fase 4: objeto anidado con el uuid real (ver backend/AGENTS.md §18).
  nomenclator?: { id: string; name: string; active: boolean } | null;
}
export interface NomenclatorItemDetailed extends NomenclatorItem, Metadata {
  child_items: NomenclatorItem[];
}