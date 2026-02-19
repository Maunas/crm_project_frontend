import { useCallback, useState } from "react"

export const useListPagination = (totalPages: number, pageSize: number = 24) => {
  const [page, setPage] = useState<number>(1)

  const handlePage = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    if (value === page) return
    setPage(value)
  }, [page])

  return { page, pageSize, pageComponentProps: { totalPages, page, handlePage } }
}

