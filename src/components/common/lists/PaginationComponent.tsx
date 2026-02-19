import { Pagination } from "@mui/material"

interface PaginationComponentProps {
  totalPages: number,
  page: number,
  handlePage: (event: React.ChangeEvent<unknown>, value: number) => void
}
export const PaginationComponent = ({ totalPages, page, handlePage }: PaginationComponentProps) => {
  if (totalPages <= 1) return null
  return (
    <Pagination
      count={totalPages}
      page={page}
      shape="rounded"
      color="secondary"
      onChange={handlePage}
    />
  )
}
