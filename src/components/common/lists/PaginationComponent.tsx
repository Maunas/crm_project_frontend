import { Box, Pagination } from "@mui/material"

interface PaginationComponentProps {
  totalPages: number,
  page: number,
  handlePage: (event: React.ChangeEvent<unknown>, value: number) => void
}
export const PaginationComponent = ({ totalPages, page, handlePage }: PaginationComponentProps) => {
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
