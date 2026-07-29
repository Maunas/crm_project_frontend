import { useCallback, useMemo, useState } from "react"
import type { Paginable } from "src/types/shared"

export const useListPagination = <T,>(list: Paginable<T> | null, pageSize: number = 24) => {
  //Es la última página usada para buscar. Puede estar desincronizado de lo mostrado en el paginationComponent.
  const [fetchPage, setFetchPage] = useState<number>(1)
  //Cuando la página es la misma (goToPageOne), refresh fuerza el cambio
  const [refresh, setRefresh] = useState<number>(0)

  const handlePage = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    if (!list) return
    setFetchPage(Math.max(1, Math.min(value, list.total_pages)))
  }, [list])

  const goToPageOne = useCallback(() => {
    if (fetchPage !== 1) return setFetchPage(1)
    setRefresh(prev => prev + 1)
  }, [fetchPage])

  //Componente para asignar rápidamente a PaginationComponent
  const pageComponentProps = useMemo(() => ({
    totalPages: list?.total_pages ?? 0,
    page: list?.page ?? 1,
    totalItems: list?.total,
    currentItems: list?.items.length,
    pageSize,
    handlePage
  })
    , [list, pageSize, handlePage])

  return {
    fetchPage, pageSize, refresh, goToPageOne, pageComponentProps
  }
}

