import CommonButton from 'src/components/ui/buttons/CommonButton'
import type { LeadFieldDetailed } from 'src/types/leadFields'
import { Box, List, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

interface ValidationListProps {
    leadField: LeadFieldDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

export const ValidationList = ({ leadField, handleSidebar }: ValidationListProps) => {

    const { palette } = useTheme()

    if (leadField.validation_rules.length === 0) {
        return (
            <Stack spacing={2} sx={{ justifyContent: "center" }}>
                <Typography variant="h4" sx={{ textAlign: "center" }}>No hay validaciones cargadas</Typography>
                <CommonButton actionType='CREATE' variant='contained' onClick={() => handleSidebar("UPDATE_VAL", leadField)}>
                    Agregar
                </CommonButton>
            </Stack>
        )
    }

    return (
        <Stack spacing={2}>
            <Stack direction="row" useFlexGap spacing={2} sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="h3">Validaciones</Typography>
                <CommonButton actionType='MODIFY' variant='contained' sx={{ marginLeft: "auto" }} size="small"
                    onClick={() => handleSidebar("UPDATE_VAL", leadField)} />
            </Stack>
            <List>
                {leadField.validation_rules.map(val =>
                    <ListItem key={val.id} disableGutters sx={{ py: .5 }}>
                        <ListItemText primary={
                            <Stack spacing={1}>
                                <Stack>
                                    <Typography sx={{ fontWeight: "bold" }}>
                                        {val.name}
                                    </Typography>
                                    <Typography variant='body2' sx={{ fontStyle: "italic", color: palette.error.main }} >
                                        {val.error_message}
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
                    </ListItem>
                )}
            </List >
        </Stack >
    )
}
