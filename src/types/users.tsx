import type { Metadata } from "./common"

export interface UserLogin {
    email: string,
    password: string
}

export interface UserData extends Metadata {
    id: number,
    email: string,
    is_superuser: boolean,
    organizations_access: OrganizationAccess[]
}

export interface OrganizationAccess extends Metadata {
    id: number,
    organization_id: number,
    roles: Role[]
}

export interface Role extends Metadata {
    id: number,
    name: string,
    code: string,
    organization_id: number | null
}