import { useCallback, useMemo, useState } from "react"
import type { OrderParams, OrderSearchParams, SearchParams } from "src/types/shared"

export const useOrderSeachList = (
    defaultValues?: OrderSearchParams
) => {

    const {
        order_by: defOrderBy,
        ascending: defAsc,
        search: defSearch,
        search_fields: defFields,
    } = defaultValues ?? {}

    const [orderParams, setOrderParams] = useState<OrderParams>({ order_by: defOrderBy, ascending: defAsc })
    const [searchParams, setSearchParams] = useState<SearchParams>({ search: defSearch, search_fields: defFields })
    const [filterParams, setFilterParams] = useState<Record<string, string>>({})

    const handleOrderChange = useCallback((orderBy?: string, asc: boolean = false) => {
        if (!orderBy) setOrderParams({})
        else setOrderParams({ order_by: orderBy, ascending: asc })
    }, [])

    const handleSearchChange = useCallback((search?: string, searchField?: string) => {
        if (!search) setSearchParams({})
        else setSearchParams({ search, search_fields: searchField })
    }, [])

    const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
        setFilterParams(newFilters)
    }, [])

    const fetchParams = useMemo(() => (
        {
            ...orderParams,
            ...searchParams,
            ...filterParams,
        }), [orderParams, searchParams, filterParams])

    // Memoizado para que changeHandlers sea una referencia estable (los handlers internos
    // ya lo son vía useCallback) y el React Compiler pueda preservar la memoización manual
    // en los consumidores que envuelven estos handlers.
    const changeHandlers = useMemo(() => ({
        handleOrderChange, handleSearchChange, handleFilterChange, filterParams
    }), [handleOrderChange, handleSearchChange, handleFilterChange, filterParams])

    return ({
        fetchParams, handleOrderChange, handleSearchChange, handleFilterChange, filterParams,
        changeHandlers
    })
}