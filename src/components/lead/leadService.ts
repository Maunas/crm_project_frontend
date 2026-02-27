import axios from "axios";
import { API_BASE_URL, orderList } from "../../generalService";
import type { Lead, LeadDetailed, LeadPostValue } from "../../types/leads";
import type { LeadListParams, Paginable } from "../../types/common";
import type { LeadPostForm } from "./LeadForm";
import type { LeadField } from "../../types/leadFields";

export const getLeads = async <T extends LeadListParams>(params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadDetailed : Lead>> => {
  const lead = await axios.get(`${API_BASE_URL}/leads`, { params });
  return { ...lead.data, items: orderList(lead.data.items) };
};

export const getLead = async (id: number): Promise<LeadDetailed> => {
  const lead = await axios.get(`${API_BASE_URL}/leads/${id}`);
  return lead.data;
};
export const simulateCreateLead = async (body: FormData): Promise<Lead> => {
  const lead = await axios.post(`${API_BASE_URL}/leads/simulate`, body);
  return lead.data;
};

export const createLead = async (body: FormData): Promise<LeadDetailed> => {
  const lead = await axios.post(`${API_BASE_URL}/leads`, body);
  return lead.data;
};

export const updateLead = async (body: FormData, id: number): Promise<Lead> => {
  const lead = await axios.put(`${API_BASE_URL}/leads/${id}`, body);
  return lead.data;
};

export const enableLead = async (id: number): Promise<{ actived: boolean }> => {
  const lead = await axios.put(`${API_BASE_URL}/leads/active/${id}`);
  return lead.data;
};
export const disableLead = async (id: number): Promise<{ action: string }> => {
  const lead = await axios.delete(`${API_BASE_URL}/leads/${id}`);
  return lead.data;
};


/******************************************** Auxiliares **************************************************/

/*************  FormData  ****************/

/** Crea un objeto FormData a partir de los datos de un formulario. Debe ser en formato { fieldName: string, data: object } */
export const createFormData = <T extends { fieldName: string, data: object }>(fields: T[]) => {
  const formData = new FormData()
  fields.forEach(item => {
    formData.set(item.fieldName, JSON.stringify(item.data))
  })
  return formData
}

export const createFormDataFromLead = (data: LeadPostForm) => {
  const fields: { fieldName: string, data: object }[] = []
  const dataValues: LeadPostValue[] = []

  for (const fieldValue of data.values) {
    if (fieldValue.fieldData.field_type_code !== "FILE") {
      dataValues.push({ field_id: fieldValue.field_id, value: fieldValue.value })
      continue
    }
    //Si es un string, no se ha modificado el file, se envia solo en el cuerpo principal
    if (typeof fieldValue?.value === "string") {
      dataValues.push({ field_id: fieldValue.field_id, value: fieldValue.value })
      continue
    }
    //Si es un arreglo, es porque se modifico el archivo. Se envia el nuevo archivo en un campo aparte. Toma solo el primer archivo.
    if (fieldValue?.value?.length > 0) {
      fields.push({ fieldName: `file-${fieldValue.field_id}`, data: fieldValue?.value?.[0] })
      dataValues.push({ field_id: fieldValue?.field_id, value: (fieldValue?.value as FileList)?.[0].name })
      continue
    }
  }
  fields.push({ fieldName: "data", data: { ...data, values: dataValues } })
  return createFormData(fields)
}

/*************  FormData  ****************/

//Busca todos las opciones de los posibles selectores de un formulario. Busca en todos ellos 
export const updateSelectorOptions = async<T>
  (leadFields: LeadField[], idField: keyof LeadField, currentMap: Map<number, T[]>, filterTypes: string[], fetchFunction: (id: number) => Promise<T[]>) => {
  const newMap = new Map<number, T[]>()
  const promises: Array<Promise<void>> = []

  for (const leadField of leadFields) {
    if (!leadField.field_type_code) continue
    if (!filterTypes.includes(leadField.field_type_code)) continue
    const fetchId = Number(leadField[idField])
    if (newMap.has(fetchId)) continue
    //Si ya existe, lo recupera sin hacer fetch
    if (currentMap.has(fetchId)) {
      newMap.set(fetchId, currentMap.get(fetchId)!)
    }
    //Si no existe, hace el fetch, lo pone en el arreglo de promesas, y al terminar lo pone en el map.
    promises.push(fetchFunction(fetchId).then(res => {
      newMap.set(fetchId, res)
    }))
  }
  //Cuando terminen todas las promesas, devuelve el mapa de opciones
  await Promise.all(promises)
  return newMap
}
