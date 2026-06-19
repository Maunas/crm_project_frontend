import { Alert } from '@mui/material'
import type { ToastContentProps } from 'react-toastify'

interface CustomToastContentProps extends ToastContentProps {
    data: unknown & { message: string }
}

export default function Toast({ data, toastProps }: CustomToastContentProps) {
    const toastType = toastProps.type === "default" ? undefined : toastProps.type
    return (
        <Alert severity={toastType}
            sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", color: "text.primary" }}>
            {data.message}
        </Alert>
    )
}
