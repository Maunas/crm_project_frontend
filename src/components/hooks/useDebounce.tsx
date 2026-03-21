import { useCallback, useRef, useState } from "react"
/**Asegura un tiempo de "timeout" milisegundos antes de realizar la función.
 * Evita mandar una petición cuando el valor cambia rápidamente, por ejemplo, ante un onChange en un input.
 */
export const useDebounce = (timeout = 1000) => {

    const idTimeout = useRef<number | undefined>(undefined)
    const [loading, setLoading] = useState<boolean>(false)

    const debouncedFunction = useCallback((callback: () => Promise<void>) => {
        setLoading(true)
        clearTimeout(idTimeout.current)
        idTimeout.current = setTimeout(() => {
            callback().finally(()=>setLoading(false))
        }, timeout
        )
    }, [timeout])

    return ({ debouncedFunction, loading })
}
