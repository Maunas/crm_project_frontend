import axios from "axios";
import { API_BASE_URL, orderList } from "../../generalService";
import type { Lead, LeadDetailed } from "../../types/leads";
import type { Paginable } from "../../types/common";

interface Params {
  detailed?: boolean;
  only_active?: boolean;
  page?: number;
  campaign_id?: number;
}

export const getLeads = async <T extends Params>( params?: T )
: Promise<Paginable<T["detailed"] extends true ? LeadDetailed : Lead>> => {
  const lead = await axios.get(`${API_BASE_URL}/leads`, { params });
  return {...lead.data, items: orderList(lead.data.items)};
};

export const getLead = async (id: number): Promise<LeadDetailed> => {
  const lead = await axios.get(`${API_BASE_URL}/leads/${id}`);
  return lead.data;
};
export const simulateCreateLead = async (body: FormData): Promise<Lead> => {
  const lead = await axios.post(`${API_BASE_URL}/leads/simulate`, body);
  return lead.data;
};

export const createLead = async (body: FormData): Promise<Lead> => {
  const lead = await axios.post(`${API_BASE_URL}/leads`, body);
  return lead.data;
};


export const updateLead = async (body: FormData, id:number): Promise<Lead> => {
  const lead = await axios.put(`${API_BASE_URL}/leads/${id}`, body);
  return lead.data;
};