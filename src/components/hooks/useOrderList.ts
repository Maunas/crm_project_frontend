import { useCallback, useState } from "react"

export const useOrderList = (orderListFunction: (
    orderBy: number | string | null,
    ascending: boolean
) => void) => {

    const [orderBy, setOrderBy] = useState<number | string | null>(null)
    const [ascending, setAscending] = useState<boolean>(true)

    const orderList = useCallback((orderBy: number | string | null, ascending: boolean) => {
        setOrderBy(orderBy)
        setAscending(ascending)
        orderListFunction(orderBy, ascending)
    }, [orderListFunction])

    //Ascendente -> Descendente -> Sin orden
    const handleOrderList = useCallback((field: number | string | null) => {
        if (orderBy !== field) return orderList(field, true)
        if (ascending) return orderList(field, false)
        orderList(null, true)
    }, [orderBy, ascending, orderList])

    return ({ orderBy, ascending, handleOrderList })
}
