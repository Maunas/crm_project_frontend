import { Box, Stack, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import LockIcon from "@mui/icons-material/Lock"
import CommonButton from "shared/ui/buttons/CommonButton"
import { useTheme } from "@mui/material/styles"

/**
 * Se muestra en vez del contenido de una ruta cuando el usuario no tiene el permiso necesario
 * para verla (ver RequirePermission en src/app/RequirePermission.tsx). A propósito no redirige
 * a otro lado: se queda en la URL pedida y explica por qué no puede entrar.
 */
export const Unauthorized = () => {
    const nav = useNavigate()
    const { palette } = useTheme()

    return (
        <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", py: 10, px: 3,
        }}>
            <Stack spacing={2} sx={{ alignItems: "center", maxWidth: 420 }}>
                <LockIcon sx={{ fontSize: 48, color: palette.text.secondary }} />
                <Typography variant="h5">No tenés acceso a esta sección</Typography>
                <Typography variant="body1" color="text.secondary">
                    Tu usuario no tiene el permiso necesario para ver esta página en la organización actual.
                    Si creés que deberías tener acceso, consultá con quien administra tu organización.
                </Typography>
                <CommonButton actionType="RETURN" variant="outlined" onClick={() => nav("/dashboard", { replace: true })}>
                    Volver al Dashboard
                </CommonButton>
            </Stack>
        </Box>
    )
}
