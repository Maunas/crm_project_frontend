/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react"
export const useLoading = (fetchFn?: (...props: any[]) => Promise<unknown>) => {
    const [loading, setLoading] = useState<boolean>(false)

    const fetchWithLoading = useCallback((...props: any[]) => {
        if (!fetchFn) return
        setLoading(true)
        return fetchFn(...props)
            .finally(() => setLoading(false))
    }, [fetchFn])

    return {
        loading, setLoading, fetchWithLoading
    }
}
