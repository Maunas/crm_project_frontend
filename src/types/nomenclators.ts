import type { Metadata } from "./common";

export interface NomenclatorPost {
  name: string | null;
  campaign_id?: number | null;
  parent_nomenclator_id?: number | null;
}

export interface Nomenclator extends NomenclatorPost {
  id: number;
  organization_id?: number | null;
}

export interface NomenclatorDetailed extends Nomenclator, Metadata {
  sub_nomenclators?: Nomenclator[];
  items?: NomenclatorItem[];
}
export interface NomenclatorItemPost {
  code: string | null;
  value: string | null;
  nomenclator_id: number | null;
  parent_item_id?: number | null;
  organization_id?: number | null;
}
export interface NomenclatorItem extends NomenclatorItemPost {
  id: number;
}
export interface NomenclatorItemDetailed extends NomenclatorItem, Metadata {
  parent_item?: NomenclatorItem;
}