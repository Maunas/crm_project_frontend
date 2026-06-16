import type { Metadata } from "./shared"

export interface LeadContactStatePost {
    name: string,
    color: string
}

export interface LeadContactState extends LeadContactStatePost {
    id: number,
    active: boolean,
    order: number,
    is_initial: boolean
    organization_id: number
}

export interface LeadContactStateDetailed extends LeadContactState, Metadata { }