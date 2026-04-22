import type { LeadPostForm } from "./leadForm/LeadForm";
import type { DeleteResponse, EnableResponse, ErrorBody, ErrorMessage, LeadFilter, ListParams, Paginable } from "../../types/common";
import type { Lead, LeadDetailed, LeadPostValue } from "../../types/leads";
import type { LeadField } from "../../types/leadFields";
import { API_BASE_URL, axiosCRM, setFormErrors } from "../../generalService";
import type { FieldArrayWithId, UseFormSetError } from "react-hook-form";

export const getLeads = async <T extends ListParams>(params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadDetailed : Lead>> => {
  const lead = await axiosCRM.get(`${API_BASE_URL}/leads`, { params });
  return lead.data;
};

export const getFilteredLeads = async <T extends ListParams>(body: { filters: LeadFilter[] }, params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadDetailed : Lead>> => {
  const lead = await axiosCRM.post(`${API_BASE_URL}/leads/search`, body, { params });
  return lead.data;
};

export const getLead = async (id: number): Promise<LeadDetailed> => {
  const lead = await axiosCRM.get(`${API_BASE_URL}/leads/${id}`);
  return lead.data;
};
export const simulateCreateLead = async (body: FormData): Promise<Lead> => {
  const lead = await axiosCRM.post(`${API_BASE_URL}/leads/simulate`, body);
  return lead.data;
};

export const createLead = async (body: FormData): Promise<LeadDetailed> => {
  const lead = await axiosCRM.post(`${API_BASE_URL}/leads`, body);
  return lead.data;
};

export const updateLead = async (body: FormData, id: number): Promise<Lead> => {
  const lead = await axiosCRM.put(`${API_BASE_URL}/leads/${id}`, body);
  return lead.data;
};

export const enableLead = async (id: number): Promise<EnableResponse> => {
  const lead = await axiosCRM.put(`${API_BASE_URL}/leads/active/${id}`);
  return lead.data;
};
export const disableLead = async (id: number): Promise<DeleteResponse> => {
  const lead = await axiosCRM.delete(`${API_BASE_URL}/leads/${id}`);
  return lead.data;
};


/******************************************** Auxiliares **************************************************/

/*************  FormData  ****************/

/** Crea un objeto FormData a partir de los datos de un formulario. Debe ser en formato { fieldName: string, data: object } */
export const createFormData = <T extends { fieldName: string, data: object | File }>(fields: T[]) => {
  const formData = new FormData()
  fields.forEach(item => {
    if (item.fieldName === "data") formData.set(item.fieldName, JSON.stringify(item.data))
    else formData.set(item.fieldName, (item.data as File))
  })
  return formData
}

//Organiza los datos de Lead para acomodar los archivos File en un FormData
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

//Busca todos las opciones de los selectores necesarios para un formulario. Busca en todos ellos.
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

export const setLeadFormErrors = (fields: FieldArrayWithId<LeadPostForm, "values", "id">[],
  error: ErrorBody<LeadPostForm>, setError: UseFormSetError<LeadPostForm>) => {

  const leadErrorMapping = (errorArray: ErrorMessage<LeadPostForm>[]) => {
    errorArray.forEach(error => {
      //Revisa si el error no viene de un campo no relacionado a values.
      if (error.field === "campaign_id") return setError("campaign_id", { message: error.message })
      //Busca el indice del field para asignarle el error.
      const fieldIdx = fields.findIndex(field => error.field === field.fieldData.name)
      //Si no coincide con un nombre, va a root.
      if (fieldIdx === -1) return setError("root", { message: error.message });
      return setError(`values.${fieldIdx}.value`, { message: error.message })
    })
  }
  setFormErrors(error, setError, leadErrorMapping)
}

export const getSelectorField = <T>(selector: T[], field: keyof T, isMultiple: boolean) => {
  if (!isMultiple) return selector[0][field]
  return selector.map(item => item[field])
}

//Obtener el título de un lead
export const getLeadTitleArray = (lead: Lead) => {
  return lead.field_values
    .filter(fv => fv.field.title_order != null)
    .sort((a, b) => (a.field.title_order ?? 0) - (b.field.title_order ?? 0))
    .map(fv => fv.value)
}