import type { LeadPostForm } from "./leadForm/LeadForm";
import type { DeleteResponse, EnableResponse, ErrorBody, ErrorMessage, LeadFilter, LeadListParams, ListParams, Paginable } from "../../types/shared";
import type { Lead, LeadDetailed, LeadPostValue, LeadView, LeadViewDetailed, LeadViewPost } from "../../types/leads";
import type { LeadField } from "../../types/leadFields";
import { setFormErrors } from "../../services/generalService";
import type { FieldArrayWithId, UseFormSetError } from "react-hook-form";
import axiosCRM from "src/lib/axios";

export const getLeads = async <T extends ListParams>(params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadDetailed : Lead>> => {
  const lead = await axiosCRM.get(`leads`, { params });
  return lead.data;
};

export const getFilteredLeads = async <T extends ListParams>(body: { filters: LeadFilter[] }, params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadDetailed : Lead>> => {
  const lead = await axiosCRM.post(`leads/search`, body, { params });
  return lead.data;
};

export const getLead = async (id: number): Promise<LeadDetailed> => {
  const lead = await axiosCRM.get(`leads/${id}`);
  return lead.data;
};
export const simulateCreateLead = async (body: FormData): Promise<Lead> => {
  const lead = await axiosCRM.post(`leads/simulate`, body);
  return lead.data;
};

export const createLead = async (body: FormData): Promise<LeadDetailed> => {
  const lead = await axiosCRM.post(`leads`, body);
  return lead.data;
};

export const updateLead = async (body: FormData, id: number): Promise<Lead> => {
  const lead = await axiosCRM.put(`leads/${id}`, body);
  return lead.data;
};

export const enableLead = async (id: number): Promise<EnableResponse> => {
  const lead = await axiosCRM.put(`leads/active/${id}`);
  return lead.data;
};
export const disableLead = async (id: number): Promise<DeleteResponse> => {
  const lead = await axiosCRM.delete(`leads/${id}`);
  return lead.data;
};


export const bulkDeleteLead = async (body: { ids: number[] }): Promise<DeleteResponse[]> => {
  const res = await axiosCRM.post(`leads/bulk-delete`, body);
  return res.data;
};


export const getLeadViews = async <T extends LeadListParams>(params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadViewDetailed : LeadView>> => {
  const view = await axiosCRM.get(`lead_views`, { params });
  return view.data;
};

export const getLeadView = async (id: number): Promise<LeadViewDetailed> => {
  const view = await axiosCRM.get(`lead_views/${id}`);
  return view.data;
};

export const createView = async (body: LeadViewPost): Promise<LeadViewDetailed> => {
  const view = await axiosCRM.post(`lead_views`, body);
  return view.data;
};

export const updateView = async (body: LeadViewPost, id: number): Promise<LeadView> => {
  const view = await axiosCRM.put(`lead_views/${id}`, body);
  return view.data;
};

export const enableView = async (id: number): Promise<EnableResponse> => {
  const view = await axiosCRM.put(`lead_views/active/${id}`);
  return view.data;
};
export const deleteView = async (id: number): Promise<DeleteResponse> => {
  const view = await axiosCRM.delete(`lead_views/${id}`);
  return view.data;
};


/******************************************** Auxiliares **************************************************/

/*************  FormData  ****************/

/** Crea un objeto FormData a partir de los datos de un formulario. Debe ser en formato { fieldName: string, data: object } */
export const createFormData = <T extends { fieldName: string, data: object | number | File }>(fields: T[]) => {
  const formData = new FormData()
  fields.forEach(item => {
    if (item.fieldName === "data") formData.set(item.fieldName, JSON.stringify(item.data))
    else formData.set(item.fieldName, (item.data as File))
  })
  return formData
}

//Organiza los datos de Lead para acomodar los archivos File en un FormData
export const createFormDataFromLead = (data: LeadPostForm) => {
  const fields: { fieldName: string, data: number | object }[] = []
  const dataValues: LeadPostValue[] = []

  for (const fieldValue of data.values) {
    if (fieldValue.fieldData.field_type_code !== "FILE") {
      dataValues.push({ field_id: fieldValue.field_id, value: fieldValue.value })
      continue
    }
    //Si es un string, no se ha modificado el file, se envia solo en el cuerpo principal
    if (typeof fieldValue?.value === "string" || typeof fieldValue?.value === "number") {
      dataValues.push({ field_id: fieldValue.field_id, value: fieldValue.value })
      continue
    }
    //Si es un arreglo, es porque se modifico el archivo. Se envia el nuevo archivo en un campo aparte. Toma solo el primer archivo.
    if (fieldValue?.value?.length > 0) {
      fields.push({ fieldName: `file-${fieldValue.field_id}`, data: (fieldValue?.value as FileList)?.[0] })
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
export const getLeadTitleArray = (lead: Lead | LeadDetailed, short: boolean = false) => {
  if (short) {
    const firstValue = lead.field_values.find(fv => fv.field.title_order === 1)?.value
    return firstValue ? [firstValue] : ["Sin título"]
  }
  else {
    const titleArray = lead.field_values
      .filter(fv => fv.field.title_order != null && fv.value)
      .sort((a, b) => a.field.title_order - b.field.title_order)
      .map(fv => fv.value!)
    return titleArray.length > 0 ? titleArray : ["Sin título"]
  }
}