import type { BulkDeleteResponse, DeleteResponse, EnableResponse, LeadFilter, LeadListParams, ListParams, Paginable } from "src/types/shared";
import type { Lead, LeadDetailed, LeadView, LeadViewDetailed, LeadViewPost } from "src/types/leads";
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


export const bulkDeleteLead = async (body: { ids: number[] }): Promise<BulkDeleteResponse> => {
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
