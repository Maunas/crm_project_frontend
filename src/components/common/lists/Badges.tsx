import { Tooltip } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export const EnabledIcon = ({ active = false }: { active: boolean }) => {
    return (
        <Tooltip title={active ? "Habilitado" : "Deshabilitado"}
            color={active ? "success" : "error"} >
            {active
                ? <CheckCircleOutlineIcon color="success" />
                : <HighlightOffIcon color="error" />}
        </Tooltip>
    )
}
