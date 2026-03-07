import axios from "axios";
import { API_BASE_URL, axiosCRM, orderList } from "../../generalService";
import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "../../types/common";
import type { Nomenclator, NomenclatorDetailed, NomenclatorItem, NomenclatorItemDetailed, NomenclatorItemPost, NomenclatorPost } from "../../types/nomenclators";

interface NomenclatorParams extends ListParams {
    campaign_id?: number | null;
    global_nomenclator?: boolean;
}
interface NomenclatorItemParams extends ListParams {
    nomenclator_id?: number;
    parent_item_id?: number;
}
export const getNomenclators = async <T extends NomenclatorParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorDetailed : Nomenclator
>> => {
    const noms = await axiosCRM.get(`nomenclators`, { params });
    return { ...noms.data, items: orderList(noms.data.items) };
};

export const getNomenclator = async (id: number): Promise<NomenclatorDetailed> => {
    const nom = await axiosCRM.get(`${API_BASE_URL}/nomenclators/${id}`)
    return nom.data
}

export const createNomenclator = async (body: NomenclatorPost): Promise<NomenclatorDetailed> => {
    const nom = await axiosCRM.post(`${API_BASE_URL}/nomenclators`, body)
    return nom.data
}
export const updateNomenclator = async (body: NomenclatorPost, id: number): Promise<NomenclatorDetailed> => {
    const nom = await axios.put(`${API_BASE_URL}/nomenclators/${id}`, body)
    return nom.data
}
export const disableNomenclator = async (id: number): Promise<DeleteResponse> => {
    const nom = await axios.delete(`${API_BASE_URL}/nomenclators/${id}`);
    return nom.data;
};

export const enableNomenclator = async (id: number): Promise<EnableResponse> => {
    const nom = await axios.put(`${API_BASE_URL}/nomenclators/active/${id}`);
    return nom.data;
};

export const getNomenclatorItems = async <T extends NomenclatorItemParams>(params?: T): Promise<Paginable<
    T["detailed"] extends true ? NomenclatorItemDetailed : NomenclatorItem
>> => {
    const nomItem = await axiosCRM.get(`/nomenclator_items`, { params });
    return { ...nomItem.data, items: orderList(nomItem.data.items, "id") };
};
export const getNomenclatorItem = async (id: number): Promise<NomenclatorItemDetailed> => {
    const nom = await axiosCRM.get(`${API_BASE_URL}/nomenclator_items/${id}`)
    return nom.data
}
export const createNomenclatorItem = async (body: NomenclatorItemPost): Promise<NomenclatorItemDetailed> => {
    const nom = await axiosCRM.post(`${API_BASE_URL}/nomenclator_items`, body)
    return nom.data
}
export const updateNomenclatorItem = async (body: NomenclatorItemPost, id: number): Promise<NomenclatorItemDetailed> => {
    const nom = await axios.put(`${API_BASE_URL}/nomenclator_items/${id}`, body)
    return nom.data
}
export const disableNomenclatorItem = async (id: number): Promise<DeleteResponse> => {
    const nom = await axios.delete(`${API_BASE_URL}/nomenclator_items/${id}`);
    return nom.data;
};

export const enableNomenclatorItem = async (id: number): Promise<EnableResponse> => {
    const nom = await axios.put(`${API_BASE_URL}/nomenclator_items/active/${id}`);
    return nom.data;
};