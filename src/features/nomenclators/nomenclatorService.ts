import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared";
import type { Nomenclator, NomenclatorDetailed, NomenclatorItem, NomenclatorItemDetailed, NomenclatorItemPost, NomenclatorPost } from "src/types/nomenclators";
import axiosCRM from "src/lib/axios";

interface NomenclatorParams extends ListParams {
    campaign_id?: string | null;
    global_nomenclator?: boolean;
}
interface NomenclatorItemParams extends ListParams {
    nomenclator_id?: string | null;
    parent_item_id?: string;
}
export const getNomenclators = async <T extends NomenclatorParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorDetailed : Nomenclator
>> => {
    const noms = await axiosCRM.get(`nomenclators`, { params });
    return noms.data;
};

export const getNomenclator = async (id: string): Promise<NomenclatorDetailed> => {
    const nom = await axiosCRM.get(`nomenclators/${id}`)
    return nom.data
}

export const createNomenclator = async (body: NomenclatorPost): Promise<NomenclatorDetailed> => {
    const nom = await axiosCRM.post(`nomenclators`, body)
    return nom.data
}
export const updateNomenclator = async (body: NomenclatorPost, id: string): Promise<NomenclatorDetailed> => {
    const nom = await axiosCRM.put(`nomenclators/${id}`, body)
    return nom.data
}
export const disableNomenclator = async (id: string): Promise<DeleteResponse> => {
    const nom = await axiosCRM.delete(`nomenclators/${id}`);
    return nom.data;
};

export const enableNomenclator = async (id: string): Promise<EnableResponse> => {
    const nom = await axiosCRM.put(`nomenclators/active/${id}`);
    return nom.data;
};

export const getNomenclatorItems = async <T extends NomenclatorItemParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorItemDetailed : NomenclatorItem
>> => {
    const nomItem = await axiosCRM.get(`/nomenclator_items`, { params });
    return nomItem.data;
};
export const getNomenclatorItem = async (id: string): Promise<NomenclatorItemDetailed> => {
    const nom = await axiosCRM.get(`nomenclator_items/${id}`)
    return nom.data
}
export const createNomenclatorItem = async (body: NomenclatorItemPost): Promise<NomenclatorItemDetailed> => {
    const nom = await axiosCRM.post(`nomenclator_items`, body)
    return nom.data
}
export const updateNomenclatorItem = async (body: NomenclatorItemPost, id: string): Promise<NomenclatorItemDetailed> => {
    const nom = await axiosCRM.put(`nomenclator_items/${id}`, body)
    return nom.data
}
export const disableNomenclatorItem = async (id: string): Promise<DeleteResponse> => {
    const nom = await axiosCRM.delete(`nomenclator_items/${id}`);
    return nom.data;
};

export const enableNomenclatorItem = async (id: string): Promise<EnableResponse> => {
    const nom = await axiosCRM.put(`nomenclator_items/active/${id}`);
    return nom.data;
};