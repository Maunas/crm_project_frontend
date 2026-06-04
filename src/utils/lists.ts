export function orderList(list: number[], desc = false) {
    const newList = [...list];
    return newList.sort((a, b) => {
        return desc ? b - a : a - b;
    });
}

export function orderListByField(list: [{ [orderField]: number }], orderField: string = "id", desc = false) {
    const newList = [...list];
    return newList.sort((a, b) => {
        return desc
            ? (b?.[orderField] ?? 0) - (a?.[orderField] ?? 0)
            : (a?.[orderField] ?? 0) - (b?.[orderField] ?? 0);
    });
}

export const getListField = <T>(list: T[], field: keyof T, isMultiple: boolean) => {
    if (!isMultiple) return list[0][field]
    return list.map(item => item[field])
}

/** Devuelve el mismo callback, pero sin propagactión de evento */
export const stopPropagationEvent = (callback: () => void = () => { }) => (e: React.SyntheticEvent) => {
    e.stopPropagation()
    return callback()
}