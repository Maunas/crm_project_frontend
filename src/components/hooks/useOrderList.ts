import { useCallback, useMemo, useState } from "react"

export const useOrderList = (orderListFunction: (
    orderBy: number | string | null,
    ascending: boolean
) => void) => {

    const [orderBy, setOrderBy] = useState<number | string | null>(null)
    const [ascending, setAscending] = useState<boolean>(true)

    //Cambio manual de setters, sin llamar a la funcion externa.
    const setOrderList = useCallback((orderBy: number | string | null, ascending: boolean) => {
        setOrderBy(orderBy)
        setAscending(ascending)
    }, [])

    const orderList = useCallback((orderBy: number | string | null, ascending: boolean) => {
        setOrderList(orderBy, ascending)
        orderListFunction(orderBy, ascending)
    }, [orderListFunction, setOrderList])

    //Ascendente -> Descendente -> Sin orden
    const handleOrderList = useCallback((field: number | string | null) => {
        if (orderBy !== field) return orderList(field, true)
        if (ascending) return orderList(field, false)
        orderList(null, true)
    }, [orderBy, ascending, orderList])

    const orderProps = useMemo(() => ({ orderBy, ascending, handleOrderList }), [orderBy, ascending, handleOrderList])

    return ({ orderBy, ascending, setOrderList, handleOrderList, orderProps })
}
