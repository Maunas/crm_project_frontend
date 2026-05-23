import { toast } from "react-toastify"
import Toast from "shared/ui/lists/Toast"

type ToastMode = "success" | "error" | "warning" | "default" | "info"

export const showToast = (message: string, mode: ToastMode = "default") => {
    if (mode === "default") toast(Toast, { data: { message: message }, style: { padding: 0 } })
    else toast[mode](Toast, { data: { message: message } })
}