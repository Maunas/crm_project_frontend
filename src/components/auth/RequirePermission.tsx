import type { ReactNode } from "react"
import { useUserContext } from "src/stores/UserContext"
import { Unauthorized } from "src/pages/Unauthorized"

interface RequirePermissionProps {
    //Codename del permiso necesario para ver el contenido (ej "lead:view"). Si se pasa un arreglo, alcanza con
    //tener CUALQUIERA de esos permisos (ej "/org-properties", que agrupa varias subsecciones con permiso propio
    //cada una). Si no se pasa nada, no bloquea (útil para rutas que cualquier usuario logueado puede ver, ej
    //Dashboard/Perfil).
    permission?: string | string[],
    children: ReactNode
}

/**
 * Envuelve el elemento de una ruta en routes.tsx y bloquea su contenido si el usuario no tiene el
 * permiso indicado en la organización activa. A propósito NO redirige: se queda en la misma URL y
 * muestra una página de aviso (Unauthorized), tanto si se llega por click en el sidebar (ya filtrado,
 * no debería pasar) como si se entra directo por URL.
 */
export const RequirePermission = ({ permission, children }: RequirePermissionProps) => {

    const { hasPermission } = useUserContext()

    const authorized = !permission || permission.length === 0
        || (Array.isArray(permission) ? permission.some(hasPermission) : hasPermission(permission))

    if (!authorized) return <Unauthorized />

    return children
}
