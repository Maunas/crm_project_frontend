import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { ChipTooltip } from '../details/ChipTooltip';
import { memo } from 'react';

interface IconProps {
    active: boolean,
    trueTooltip?: string,
    falseTooltip?: string,
    size?: "small" | "medium",
    isAvatar?: boolean
}
export const EnabledIcon = memo(({ active = false, trueTooltip = "Habilitado", isAvatar = false, falseTooltip = "Deshabilitado", size = "medium" }: IconProps) => {

    return (
        <ChipTooltip title={active ? trueTooltip : falseTooltip}
            color={active ? "success" : "error"} size={size} boxed>
            <>
                {isAvatar &&
                    (active
                        ? <CheckIcon color="inherit" fontSize={size} />
                        : <CloseIcon color="inherit" fontSize={size} />
                    )}
                {!isAvatar &&
                    (active
                        ? <CheckCircleOutlinedIcon color="success" fontSize={size} />
                        : <HighlightOffIcon color="error" fontSize={size} />
                    )}
            </>
        </ChipTooltip>
    )
})
