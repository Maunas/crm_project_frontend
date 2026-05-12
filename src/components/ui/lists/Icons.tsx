import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ChipTooltip } from '../details/ChipTooltip';
import { memo } from 'react';

interface IconProps {
    active: boolean,
    trueTooltip?: string,
    falseTooltip?: string,
    size?: "small" | "medium"
}
export const EnabledIcon = memo(({ active = false, trueTooltip = "Habilitado", falseTooltip = "Deshabilitado", size = "medium" }: IconProps) => {
    return (
        <ChipTooltip title={active ? trueTooltip : falseTooltip}
            color={active ? "success" : "error"} size="small">
            {active
                ? <CheckCircleOutlinedIcon color="success" fontSize={size} />
                : <HighlightOffIcon color="error" fontSize={size} />}
        </ChipTooltip>
    )
})
