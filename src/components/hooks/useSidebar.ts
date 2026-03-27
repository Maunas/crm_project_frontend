import { useCallback, useEffect, useRef, useState } from 'react'
import type { SetURLSearchParams } from 'react-router-dom'

export const useSidebar = <T>(params?: URLSearchParams, setParams?: SetURLSearchParams,
    callback?: (id: number) => Promise<T>, detailsModeName?: string, paramIdField?: keyof T
) => {

    //setParams, al ser recibido como prop, es inestable y causa re-renders innecesarios.
    //Al convertirlo a un ref, se mantiene estable
    const setParamsRef = useRef(setParams)
    useEffect(() => {
        setParamsRef.current = setParams
    }, [setParams])

    // Manejo de Search Params
    const addParam = useCallback((entity: T, idField: keyof T, setParam: SetURLSearchParams) => {
        setParam(prev => {
            const next = new URLSearchParams(prev)
            const selectedValue = entity?.[idField]
            if (selectedValue != null) {
                next.set("selected", String(selectedValue))
            }
            return next
        }, { replace: true })
    }, [])

    const deleteParam = useCallback((setParam: SetURLSearchParams) => {
        setParam(prev => {
            const next = new URLSearchParams(prev)
            next.delete("selected")
            return next
        }, { replace: true })
    }, [])

    const updateParams = useCallback((mode: string | null, entity: T | null) => {
        if (!setParamsRef.current || !detailsModeName || !paramIdField) return

        if (entity && mode === detailsModeName) addParam(entity, paramIdField, setParamsRef.current)
        else deleteParam(setParamsRef.current)
    }, [addParam, deleteParam, detailsModeName, paramIdField])


    //Manejo del sidebar
    const [sidebarMode, setSidebarMode] = useState<string | null>(null)
    const [selectedEntity, setSelectedEntity] = useState<T | null>(null)

    const handleSidebar = useCallback((mode: string, entity: T | null) => {
        setSelectedEntity(entity)
        if (mode === "KEEP") return
        setSidebarMode(mode)
        updateParams(mode, entity)
    }, [updateParams])

    const closeSidebar = useCallback(() => {
        setSelectedEntity(null)
        setSidebarMode(null)
        if (setParamsRef.current) deleteParam(setParamsRef.current)
    }, [deleteParam])

    //Inicialización cuando hay un searchparam.
    const initFlag = useRef<boolean>(false)

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
