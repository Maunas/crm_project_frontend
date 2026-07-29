import { Divider, Pagination, Stack, Typography } from "@mui/material"
import { memo } from "react"

interface PaginationComponentProps {
  totalPages: number,
  page: number,
  totalItems: number | undefined,
  currentItems: number | undefined,
  pageSize: number,
  handlePage: (event: React.ChangeEvent<unknown>, value: number) => void,
  size?: "small" | "medium" | "large"
}
const PaginationComponent = memo(({ totalPages, totalItems = 0, currentItems = 0, pageSize, page, handlePage, size = "small" }: PaginationComponentProps) => {

  const firstElement = ((page - 1) * pageSize) + 1
  const lastElement = ((page - 1) * pageSize) + currentItems

  if (totalPages <= 1 || totalItems === 0 || currentItems === 0) return

  return (
    <Stack spacing={1} sx={{ px: 2 }}>
      <Divider />
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", px: 1 }}>
        <Typography variant={size === "small" ? "body2" : "body1"} color="text.secondary">
          {`Mostrando elementos ${firstElement}-${lastElement} de ${totalItems}`}
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          shape="rounded"
          color="primary"
          onChange={handlePage}
          size={size}
        />
      </Stack>
    </Stack>
  )
})

export default PaginationComponent