import type { ToastContentProps } from 'react-toastify'
import { CustomAlert } from './CustomAlert'

interface CustomToastContentProps extends ToastContentProps {
    data: unknown & { message: string }
}

export default function Toast({ data, toastProps }: CustomToastContentProps) {
    const toastType = toastProps.type === "default" ? undefined : toastProps.type
    return (
        <CustomAlert severity={toastType}
            sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", color: "text.primary" }}>
            {data.message}
        </CustomAlert>
    )
}
