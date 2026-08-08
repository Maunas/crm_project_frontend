import type { Metadata } from "./shared";

export interface NomenclatorPost {
  name: string | null;
  // Reemplaza al viejo parent_nomenclator_id único: un catálogo puede tener varios padres válidos (M2M).
  parent_nomenclator_ids?: string[];
}

export interface Nomenclator extends Omit<NomenclatorPost, "parent_nomenclator_ids"> {
  id: string;
  organization_id: number | null;
  parent_nomenclators: Nomenclator[];
}

export interface NomenclatorDetailed extends Nomenclator, Metadata {
  child_nomenclators: Nomenclator[];
}

export interface NomenclatorItemPost {
  value: string | null;
  nomenclator_id: string | null;
  // Reemplaza al viejo parent_item_id único: un ítem puede tener varios ítems padre (uno por cada catálogo padre válido).
  parent_item_ids?: string[];
}
export interface NomenclatorItem extends Omit<NomenclatorItemPost, "parent_item_ids" | "nomenclator_id"> {
  id: string;
  organization_id: number | null;
  nomenclator_id: number | null; // FK embebida: la respuesta trae el id interno, no el public_uuid
  parent_items: NomenclatorItem[]
  // Objeto anidado con el uuid real (preferir a la FK embebida).
  nomenclator?: { id: string; name: string; active: boolean } | null;
}
export interface NomenclatorItemDetailed extends NomenclatorItem, Metadata {
  child_items: NomenclatorItem[];
}