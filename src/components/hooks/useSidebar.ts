import { useCallback, useState } from 'react'

export const useSidebar = <T>() => {
        const [sidebarMode, setSidebarMode] = useState<string | null>(null)
        const [selectedEntity, setSelectedEntity] = useState<T | null>(null)
        
        const handleSidebar = useCallback((mode: string, entity: T | null) => {
            setSelectedEntity(entity)
            if (mode === "KEEP") return
            setSidebarMode(mode)
        },[])
        const closeSidebar = useCallback(() => {
            setSelectedEntity(null)
            setSidebarMode(null)
        },[])

  return { sidebarMode, selectedEntity, handleSidebar, closeSidebar }
}
