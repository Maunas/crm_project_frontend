import { Box, Pagination } from "@mui/material"
import { memo } from "react"

interface PaginationComponentProps {
  totalPages: number,
  page: number,
  handlePage: (event: React.ChangeEvent<unknown>, value: number) => void
}
export const PaginationComponent = memo(({ totalPages, page, handlePage }: PaginationComponentProps) => {
  return (
    <Box width="100%">
      <Pagination
        count={totalPages}
        page={page}
        shape="rounded"
        color="primary"
        onChange={handlePage}
      />
    </Box>
  )
}
)