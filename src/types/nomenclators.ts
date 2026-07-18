import type { Metadata } from "./shared";

export interface NomenclatorPost {
  name: string | null;
  parent_nomenclator_id?: number | null;
}

export interface Nomenclator extends Omit<NomenclatorPost, "parent_nomenclator_id"> {
  id: number;
  organization_id: number | null;
  parent_nomenclator: Nomenclator;
}

export interface NomenclatorDetailed extends Nomenclator, Metadata { }

export interface NomenclatorItemPost {
  value: string | null;
  nomenclator_id: number | null;
  parent_item_id?: number | null;
}
export interface NomenclatorItem extends Omit<NomenclatorItemPost, "parent_item_id"> {
  id: number;
  organization_id: number | null;
  parent_item: NomenclatorItem | null
}
export interface NomenclatorItemDetailed extends NomenclatorItem, Metadata { }