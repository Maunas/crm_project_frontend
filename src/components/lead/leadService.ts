import axios from "axios";
import { API_BASE_URL } from "../../generalService";
import type { Lead, LeadDetailed } from "../../types/leads";

interface Params {
  detailed?: boolean;
  only_active?: boolean;
  page?: number;
  campaign_id?: number;
}

export const getLeads = async <T extends Params>(params?: T): 
Promise<T["detailed"] extends true ? LeadDetailed[] : Lead[]> => {
  const lead = await axios.get(`${API_BASE_URL}/leads`, { params });
  return lead.data.items;
};

export const getLead = async (id: number): Promise<Lead> => {
  const lead = await axios.get(`${API_BASE_URL}/leads/${id}`);
  return lead.data;
};
