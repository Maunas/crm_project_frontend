/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react"
export const useLoading = (asyncFn?: (...props: any[]) => Promise<unknown>) => {
    const [loading, setLoading] = useState<boolean>(false)

    const fnWithLoading = useCallback((...props: any[]) => {
        if (!asyncFn) return
        setLoading(true)
        return asyncFn(...props)
            .finally(() => setLoading(false))
    }, [asyncFn])

    return {
        loading, setLoading, fnWithLoading
    }
}
