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
        only_active: defOnlyAct
    } = defaultValues ?? {}

    const [orderParams, setOrderParams] = useState<OrderParams>({ order_by: defOrderBy, ascending: defAsc })
    const [searchParams, setSearchParams] = useState<SearchParams>({ search: defSearch, search_fields: defFields })
    const [onlyActive, setOnlyActive] = useState<boolean>(defOnlyAct ?? false)


    const handleOrderChange = useCallback((orderBy?: string, asc: boolean = false, onlyActive: boolean = false) => {
        if (!orderBy) setOrderParams({})
        else setOrderParams({ order_by: orderBy, ascending: asc })
        setOnlyActive(onlyActive)
    }, [])

    const handleSearchChange = useCallback((search?: string, searchField?: string) => {
        if (!search) setSearchParams({})
        else setSearchParams({ search, search_fields: searchField })
    }, [])

    const fetchParams = useMemo(() => (
        {
            ...orderParams,
            ...searchParams,
            only_active: onlyActive
        }), [orderParams, searchParams, onlyActive])

    return ({ fetchParams, handleOrderChange, handleSearchChange })
}