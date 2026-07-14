import { useCallback, useMemo, useState } from "react"

export const useOrderSeachList = () => {

    const [orderParams, setOrderParams] = useState<{ order_by?: string, ascending: boolean }>({ ascending: true })
    const [searchParams, setSearchParams] = useState<{ search?: string, search_fields?: string }>({})
    const [onlyActive, setOnlyActive] = useState<boolean>(false)


    const handleOrderChange = useCallback((orderBy?: string, asc: boolean = false, onlyActive: boolean = false) => {
        if (!orderBy) setSearchParams({})
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