import CommonButton from 'shared/ui/buttons/CommonButton'
import { CodeBox } from 'shared/ui/details/CodeBox'
import type { LeadFieldDetailed } from 'src/types/leadFields'
import { List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

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
                    onClick={() => handleSidebar("UPDATE_VAL", leadField)} onlyTooltip>
                    Modificar
                </CommonButton>
            </Stack>
            <List disablePadding>
                {leadField.validation_rules.map(val =>
                    <ListItem key={val.id} disablePadding sx={{ mb: 1, overflow: "hidden" }} component={Paper} elevation={7} >
                        <ListItemText sx={{ m: 0 }} primary={
                            <Stack spacing={.25}>
                                <Stack sx={{ p: ".5rem .75rem 0 " }}>
                                    <Typography variant="body2" sx={{ textTransform: "uppercase", fontWeight: 500 }}>
                                        {val.name}
                                    </Typography>
                                    <Typography variant='caption' sx={{ fontStyle: "italic", color: palette.error.main }} >
                                        {val.error_message}
                                    </Typography>
                                </Stack>
                                <CodeBox>
                                    <Typography variant="subtitle2" sx={{ fontFamily: "inherit" }}>
                                        {val.expression}
                                    </Typography>
                                </CodeBox>
                            </Stack>
                        } />
                    </ListItem>
                )}
            </List >
        </Stack >
    )
}
