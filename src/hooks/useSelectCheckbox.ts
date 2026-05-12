import { useCallback, useMemo, useState } from "react"

export const useSelectCheckbox = <T extends { id: number, active?: boolean }>() => {
    const [checkedItems, setCheckedItems] = useState<Map<number, T>>(new Map())

    const addItem = useCallback((item: T | T[]) => {
        const addSingleItem = (item: T) => {
            if (checkedItems.has(item.id)) return
            setCheckedItems(prev => new Map(prev).set(item.id, item))
        }

        if (Array.isArray(item)) item.map(i => addSingleItem(i))
        else addSingleItem(item)

    }, [checkedItems])


    const removeItem = useCallback((item: T) => {
        setCheckedItems(prev => {
            const newMap = new Map(prev)
            newMap.delete(item.id)
            return newMap
        })
    }, [])

    const removeAllItems = useCallback(() => {
        setCheckedItems(new Map())
    }, [])

    const areThereActiveItems = useMemo(() => {
        const valuesArray = Array.from(checkedItems.values())
        if (valuesArray.length > 0 && valuesArray[0].active !== undefined) return false
        return valuesArray.some(checked => checked.active)
    }
        , [checkedItems])
    const areThereInactiveItems = useMemo(() => {
        const valuesArray = Array.from(checkedItems.values())
        if (valuesArray.length > 0 && valuesArray[0].active !== undefined) return false
        return valuesArray.some(checked => !checked.active)
    }
        , [checkedItems])

    return ({
        checkedItems, addItem, removeItem, removeAllItems,
        areThereActiveItems, areThereInactiveItems
    })
}
