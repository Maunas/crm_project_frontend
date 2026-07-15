import { useCallback, useMemo, useState } from "react"
import type { OrderParams, SearchParams } from "src/types/shared"

export const useOrderSeachList = () => {

    const [orderParams, setOrderParams] = useState<OrderParams>({})
    const [searchParams, setSearchParams] = useState<SearchParams>({})
    const [onlyActive, setOnlyActive] = useState<boolean>(false)


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