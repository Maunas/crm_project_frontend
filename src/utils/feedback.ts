import { toast } from "react-toastify"
import Toast from "shared/feedback/Toast"

type ToastMode = "success" | "error" | "warning" | "default" | "info"

export const showToast = (message: string, mode: ToastMode = "default") => {
    if (mode === "default") toast(Toast, { data: { message: message }, style: { padding: 0 } })
    else toast[mode](Toast, { data: { message: message } })
}
/**
 * Ante un error común, presenta el error con un console.error, y muestra un toast con un mensaje genérico.
 * @param e Objeto de error devuelto
 * @param message Mensaje del toast. Por defecto: "Ha ocurrido un error."
 */
export const showCommonErrorToast = (e: unknown, message: string = "Ha ocurrido un error.") => {
    console.error(e)
    showToast(message, "error")
}