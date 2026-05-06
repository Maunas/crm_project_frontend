import axiosCRM from "../../lib/axios"

export const generalSearch = async (query: string) => {
    const res = await axiosCRM.get(`/search`, { params: { query } })
    return res.data
}