import { useCallback, useEffect, useRef, useState } from 'react'
import type { SetURLSearchParams } from 'react-router-dom'

// Manejo de Search Params
const addParam = <T>(entity: T, idField: keyof T, setParam: SetURLSearchParams) => {
    setParam(prev => {
        const selectedValue = entity?.[idField]
        if (prev.get("selected") === String(selectedValue)) return prev
        const next = new URLSearchParams(prev)
        if (selectedValue != null) {
            next.set("selected", String(selectedValue))
        }
        return next
    }, { replace: true })
}

const deleteParam = (setParam: SetURLSearchParams) => {
    setParam(prev => {
        if (!prev.has("selected")) return prev
        const next = new URLSearchParams(prev)
        next.delete("selected")
        return next
    }, { replace: true })
}

//Se recibe el setParams para que el padre pueda manejar parámetros no relacionados a sidebar.
export const useSidebar = <T>(entityIdField: keyof T, params?: URLSearchParams, setParams?: SetURLSearchParams,
    callback?: (id: number) => Promise<T>, detailsModeName?: string
) => {
    //setParams, al ser recibido como prop, es inestable y causa re-renders innecesarios.
    //Al convertirlo a un ref, se mantiene estable
    const setParamsRef = useRef(setParams)
    useEffect(() => {
        setParamsRef.current = setParams
    }, [setParams])

    const updateParams = useCallback((mode: string | null, entity: T | null) => {
        if (!setParamsRef.current || !detailsModeName) return

        if (entity && mode === detailsModeName) addParam(entity, entityIdField, setParamsRef.current)
        else deleteParam(setParamsRef.current)
    }, [detailsModeName, entityIdField])

    //Manejo del sidebar
    const [sidebarMode, setSidebarMode] = useState<string | null>(null)
    const [selectedEntity, setSelectedEntity] = useState<T | null>(null)

    const handleSidebar = useCallback((mode: string, entity: T | null = null) => {
        updateParams(mode === "KEEP" ? sidebarMode : mode, entity)
        setSelectedEntity(entity)
        if (mode !== "KEEP") setSidebarMode(mode)
    }, [updateParams, sidebarMode])

    const closeSidebar = useCallback(() => {
        setSelectedEntity(null)
        setSidebarMode(null)
        if (setParamsRef.current) deleteParam(setParamsRef.current)
    }, [])

    //Inicialización cuando hay un searchparam.
    const initFlag = useRef<boolean>(false)
    //Abre el detalle del elemento del param "selected"
    useEffect(() => {
        if (initFlag.current || !params) return
        const selectedId = params?.get("selected")
        if (selectedId && callback && detailsModeName) {
            callback(Number(selectedId)).then(res => {
                handleSidebar(detailsModeName, res)
            })
        }
        initFlag.current = true
    }, [params, callback, detailsModeName, handleSidebar])

    return { sidebarMode, selectedEntity, handleSidebar, closeSidebar }
}
