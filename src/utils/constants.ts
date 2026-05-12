import type { Organization } from "src/types/campaigns";
import type { ColorTypes } from "src/types/mui-theme.d";

export const COLORS: ColorTypes[] = ["primary", "secondary", "contrast", "info", "success", "warning", "error"]

export const SUPERUSER: Organization = { id: 0, name: "Administrador" }