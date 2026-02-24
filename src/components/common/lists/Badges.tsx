import { Tooltip } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

interface IconProps {
    active: boolean,
    trueTooltip?: string,
    falseTooltip?: string,
}
export const EnabledIcon = ({ active = false, trueTooltip = "Habilitado", falseTooltip = "Deshabilitado" }: IconProps) => {
    return (
        <Tooltip title={active ? trueTooltip : falseTooltip}
            color={active ? "success" : "error"} >
            {active
                ? <CheckCircleOutlineIcon color="success" />
                : <HighlightOffIcon color="error" />}
        </Tooltip>
    )
}
