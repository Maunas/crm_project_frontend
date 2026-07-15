import { Stack, Typography } from "@mui/material"
import type { ReactNode } from "react"

interface NoItemsMessageProps {
    search?: string,
    emptyFetchMessage?: ReactNode
    children?: ReactNode
}

export const NoItemsMessage = ({ search, emptyFetchMessage, children }: NoItemsMessageProps) => {
    return <Stack spacing={2} sx={{ justifyContent: "center", alignItems: "center", py: 5 }}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
            {
                !search ?
                    emptyFetchMessage :
                    <>
                        No se han encontrado elementos que correspondan al término:
                        <span style={{ fontStyle: "italic", fontWeight: "normal" }}> {search}</span>
                    </>
            }
        </Typography>
        {children}
    </Stack>
}
