/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react"
export const useLoading = (asyncFn?: (...props: any[]) => Promise<unknown>, externalSetter?: (loading: boolean) => void) => {
    const [loading, setLoading] = useState<boolean>(false)

    const fnWithLoading = useCallback(async (...props: any[]) => {
        if (!asyncFn) return
        setLoading(true)
        if (externalSetter) externalSetter(true)
        return asyncFn(...props)
            .finally(() => {
                setLoading(false)
                if (externalSetter) externalSetter(false)
            })
    }, [asyncFn, externalSetter])

    return {
        loading, setLoading, fnWithLoading
    }
}
