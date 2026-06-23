import type { DeleteResponse, EnableResponse, ListParams, Paginable } from "src/types/shared";
import type { LeadContactStateDetailed, LeadContactState } from "src/types/leadContactState";
import axiosCRM from "src/lib/axios";

export const getLeadContactStates = async <T extends ListParams>(params?: T)
  : Promise<Paginable<T["detailed"] extends true ? LeadContactStateDetailed : LeadContactState>> => {
  const LeadContactState = await axiosCRM.get(`lead_contact_states`, { params });
  return LeadContactState.data;
};

export const getLeadContactState = async (id: number): Promise<LeadContactStateDetailed> => {
  const LeadContactState = await axiosCRM.get(`lead_contact_states/${id}`);
  return LeadContactState.data;
};

export const createLeadContactState = async (body: FormData): Promise<LeadContactStateDetailed> => {
  const LeadContactState = await axiosCRM.post(`lead_contact_states`, body);
  return LeadContactState.data;
};

export const updateLeadContactState = async (body: FormData, id: number): Promise<LeadContactState> => {
  const LeadContactState = await axiosCRM.put(`lead_contact_states/${id}`, body);
  return LeadContactState.data;
};

export const enableLeadContactState = async (id: number): Promise<EnableResponse> => {
  const LeadContactState = await axiosCRM.put(`lead_contact_states/active/${id}`);
  return LeadContactState.data;
};
export const disableLeadContactState = async (id: number): Promise<DeleteResponse> => {
  const LeadContactState = await axiosCRM.delete(`lead_contact_states/${id}`);
  return LeadContactState.data;
};



