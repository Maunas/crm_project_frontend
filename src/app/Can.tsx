import type { ReactNode } from "react"
import { useUserContext } from "src/stores/UserContext"

interface CanProps {
    //Codename del permiso necesario (ej "lead:create"). Si se pasa un arreglo, alcanza con tener CUALQUIERA
    //de esos permisos (mismo criterio que RequirePermission, ver src/app/RequirePermission.tsx).
    permission: string | string[],
    children: ReactNode
}

/**
 * Encierra cualquier elemento puntual (botón, sección, ítem de menú, etc) que solo debería verse si el
 * usuario tiene el permiso indicado en la organización activa. A diferencia de RequirePermission (para
 * rutas completas, que muestra una página de aviso si falta el permiso), acá si falta el permiso simplemente
 * no se renderiza nada — pensado para botones de acción (ej "Crear", "Modificar") dentro de una pantalla
 * que el usuario de por sí ya puede ver.
 *
 * Uso: <Can permission="lead:create"><CommonButton actionType="CREATE">Agregar</CommonButton></Can>
 */
export const Can = ({ permission, children }: CanProps) => {

    const { hasPermission } = useUserContext()

    const authorized = Array.isArray(permission) ? permission.some(hasPermission) : hasPermission(permission)

    if (!authorized) return null

    return children
}
