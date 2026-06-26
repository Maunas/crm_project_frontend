import type { Metadata } from "./shared"

export interface LeadContactStatePost {
    name: string,
    color: string,
    is_initial: boolean
    order?: number,
}

export interface LeadContactState extends LeadContactStatePost {
    id: number,
    active: boolean,
    organization_id: number
}

export interface LeadContactStateDetailed extends LeadContactState, Metadata { }