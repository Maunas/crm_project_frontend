import type { Metadata } from "./shared"

/* --------------------------------Tags-------------------------------- */

export interface LeadTagPost {
    name: string,
    color?: string
}
export interface LeadTag extends LeadTagPost {
    id: string,
    organization_id: number
    color: string
}

export interface LeadTagDetailed extends LeadTag, Metadata { }

/* --------------------------------Sections-------------------------------- */

export interface LeadFieldSectionPost {
    name: string;
    color: string;
}

export interface LeadFieldSection extends LeadFieldSectionPost {
    id: string;
    organization_id: number;
}

export interface LeadFieldSectionDetailed extends LeadFieldSection, Metadata { }

/* --------------------------------ContactStates-------------------------------- */

export interface LeadContactStatePost {
    name: string,
    color: string,
    is_initial: boolean
    order?: number,
}

export interface LeadContactState extends LeadContactStatePost {
    id: string,
    active: boolean,
    organization_id: number
}

export interface LeadContactStateDetailed extends LeadContactState, Metadata { }