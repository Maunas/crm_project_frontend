import type { Metadata } from "./shared";

export interface Permission {
    name: string,
    codename: string,
}

export interface RolePost {
    code: string,
    name: string,
    organization_id: number
}
export interface Role extends RolePost, Metadata {
    id: number,
}
export interface RoleDetailed extends Role {
    permissions: Permission[]
}