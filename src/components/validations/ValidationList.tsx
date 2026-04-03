import { CommonButton } from '../common/details/DetailsCommonButton'
import type { LeadFieldDetailed } from '../../types/leadFields'
import { Box, Grid, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

interface ValidationListProps {
    leadField: LeadFieldDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

export const ValidationList = ({ leadField, handleSidebar }: ValidationListProps) => {

    const { palette } = useTheme()

    if (leadField.validation_rules.length === 0) {
        return (
            <Stack gap={2} justifyContent="center">
                <Typography variant="h4" textAlign="center">No hay validaciones cargadas.</Typography>
                <CommonButton actionType='MODIFY' variant='contained' onClick={() => handleSidebar("UPDATE_VAL", leadField)}>
                    Modificar Lista
                </CommonButton>
            </Stack>
        )
    }

    return (
        <Stack gap={2}>
            <Grid container gap={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h3">Lista de Validaciones</Typography>
                <CommonButton actionType='MODIFY' variant='contained' sx={{ marginLeft: "auto" }}
                    onClick={() => handleSidebar("UPDATE_VAL", leadField)}>
                    Modificar Lista
                </CommonButton>
            </Grid>
            <List>
                {leadField.validation_rules.map(val =>
                    <ListItem key={val.id} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={
                                <Stack gap={1}>
                                    <Stack>
                                        <Typography>
                                            <span style={{ fontWeight: "bold" }}>{val.name}. </span>
                                        </Typography>
                                        <Typography variant='body2'>
                                            <span>"{val.error_message}"</span>
                                        </Typography>
                                    </Stack>
                                    <Box width="100%" bgcolor={alpha(palette.background.default, .5)}
                                        textAlign="center" px={2} py={1} borderRadius={3}>
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
