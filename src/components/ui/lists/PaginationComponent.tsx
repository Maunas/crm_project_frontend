import { Box, Pagination } from "@mui/material"
import { memo } from "react"

interface PaginationComponentProps {
  totalPages: number,
  page: number,
  handlePage: (event: React.ChangeEvent<unknown>, value: number) => void,
  size?: "small" | "medium" | "large"
}
const PaginationComponent = memo(({ totalPages, page, handlePage, size = "medium" }: PaginationComponentProps) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Pagination
        count={totalPages}
        page={page}
        shape="rounded"
        color="primary"
        onChange={handlePage}
        size={size}
      />
    </Box>
  )
})

export default PaginationComponent