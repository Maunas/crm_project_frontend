import type { LeadFieldDetailed } from '../../types/leadFields'
import { Button, Grid, List, ListItem, ListItemButton, ListItemText, Stack, Typography } from '@mui/material'

interface ValidationListProps {
    leadField: LeadFieldDetailed,
    handleSidebar: (mode: string, entity: LeadFieldDetailed | null) => void,
}

export const ValidationList = ({ leadField, handleSidebar }: ValidationListProps) => {

    if (leadField.validation_rules.length === 0) {
        return (
            <Stack spacing={2} justifyContent="center">
                <Typography variant="h4" textAlign="center">No hay validaciones cargadas.</Typography>
                <Button variant='contained' onClick={() => handleSidebar("UPDATE_VAL", leadField)}>Modificar Lista</Button>
            </Stack>
        )
    }
    return (
        <>
            <Grid container spacing={2} justifyContent="space-between">
                <Typography variant="h3">Lista de Validaciones</Typography>
                <Button variant='contained' onClick={() => handleSidebar("UPDATE_VAL", leadField)}>Modificar Lista</Button>
            </Grid>
            <List>
                {leadField.validation_rules.map(val =>
                    <ListItem key={val.id} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={<Stack spacing={1}>
                                <Typography>
                                    <span style={{ fontWeight: "bold" }}>{val.name}. </span>
                                    <span>"{val.error_message}"</span>
                                </Typography>
                                <Typography paddingInlineStart={2} border="1px gray solid">{val.expression}</Typography>
                            </Stack>} />
                        </ListItemButton>
                    </ListItem>
                )}
            </List >
        </>
    )
}
