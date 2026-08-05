import { Divider, FilledInput, Pagination, PaginationItem, Stack, Typography } from "@mui/material"
import { memo, useState } from "react"

interface PaginationComponentProps {
  totalPages: number,
  page: number,
  totalItems: number | undefined,
  currentItems: number | undefined,
  pageSize: number,
  handlePage: (event: unknown, value: number) => void,
  size?: "small" | "medium"
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
        <PaginationComponentList totalPages={totalPages} page={page} handlePage={handlePage} size={size} />
      </Stack>
    </Stack>
  )
})

export default PaginationComponent

interface PaginationComponentListProps {
  totalPages: number,
  page: number,
  handlePage: (event: unknown, value: number) => void,
  size?: "small" | "medium"
}
export const PaginationComponentList = ({ totalPages, page, handlePage, size }: PaginationComponentListProps) => {

  const [manualPage, setManualPage] = useState<boolean>(false)

  const handlePageWrapper = (_: unknown, value: number) => {
    handlePage(_, value)
    setManualPage(false)
  }

  return (
    <Pagination
      count={totalPages}
      page={page}
      shape="rounded"
      color="primary"
      onChange={handlePage}
      size={size}
      renderItem={(item) => {
        if (item.selected && manualPage) return <PaginationInput value={item.page} handlePage={handlePageWrapper} size={size} autofocus />
        if (item.selected) return <PaginationItem {...item} onClick={() => setManualPage(true)} />
        return <PaginationItem {...item} />
      }}
    />
  )
}

interface PaginationInputProps {
  value: number | null,
  handlePage: (event: React.ChangeEvent<unknown>, value: number) => void,
  size?: "small" | "medium",
  autofocus?: boolean
}
export const PaginationInput = ({ handlePage, value, size = "medium", autofocus = false }: PaginationInputProps) => {
  return (
    <FilledInput type="number" defaultValue={value ?? 1} size={size}
      sx={{ minWidth: "2rem", maxWidth: "2.5rem" }}
      autoFocus={autofocus}
      slotProps={{
        input: {
          sx: {
            p: "4px",
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          },
        },
      }}
      onKeyDown={e => {
        if (e.key === "Enter") {
          handlePage(e, Number(e.currentTarget.value))
        }
      }}
      onBlur={e => handlePage(e, Number(e.currentTarget.value))} />
  )
}
