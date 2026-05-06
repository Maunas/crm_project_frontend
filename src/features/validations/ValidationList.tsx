import type { LeadFieldDetailed } from '../../types/leadFields'
import { Box, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import CommonButton from 'src/components/ui/buttons/CommonButton'

interface ValidationListProps {
    leadField: LeadFieldDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

export const ValidationList = ({ leadField, handleSidebar }: ValidationListProps) => {

    const { palette } = useTheme()

    if (leadField.validation_rules.length === 0) {
        return (
            <Stack spacing={2} sx={{ justifyContent: "center" }}>
                <Typography variant="h4" sx={{ textAlign: "center" }}>No hay validaciones cargadas.</Typography>
                <CommonButton actionType='CREATE' variant='contained' onClick={() => handleSidebar("UPDATE_VAL", leadField)}>
                    Agregar Validaciones
                </CommonButton>
            </Stack>
        )
    }

    return (
        <Stack spacing={2}>
            <Stack direction="row" useFlexGap spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h3">Lista de Validaciones</Typography>
                <CommonButton actionType='MODIFY' variant='contained' sx={{ marginLeft: "auto" }}
                    onClick={() => handleSidebar("UPDATE_VAL", leadField)}>
                    Modificar Validaciones
                </CommonButton>
            </Stack>
            <List>
                {leadField.validation_rules.map(val =>
                    <ListItem key={val.id} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={
                                <Stack spacing={1}>
                                    <Stack>
                                        <Typography>
                                            <span style={{ fontWeight: "bold" }}>{val.name}. </span>
                                        </Typography>
                                        <Typography variant='body2'>
                                            <span>"{val.error_message}"</span>
                                        </Typography>
                                    </Stack>
                                    <Box sx={{
                                        bgcolor: alpha(palette.background.default, .5), width: "100%",
                                        textAlign: "center", px: 2, py: 1, borderRadius: 3
                                    }}>
                                        <Typography variant="body1">
                                            {val.expression}
                                        </Typography>
                                    </Box>
                                </Stack>
                            } />
                        </ListItemButton>
                    </ListItem>
                )}
            </List >
        </Stack >
    )
}
