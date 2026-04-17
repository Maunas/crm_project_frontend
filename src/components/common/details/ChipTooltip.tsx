import { Tooltip, type PopperPlacementType } from "@mui/material"
import { CustomChip } from "./StyledDisplayComponents"
import { memo, type ReactElement } from "react"
import { useTheme } from "@mui/material/styles"
import type { ColorTypes } from "../../../types/mui-theme.d"

interface ChipTooltip {
    counter: boolean,
    value: string,
    color?: ColorTypes,
    children: ReactElement,
    placement?: PopperPlacementType
}

export const ChipTooltip = memo(({ counter, placement = "top", value, color = "primary", children }: ChipTooltip) => {

    const { palette } = useTheme()

    return (<Tooltip arrow placement={placement} title={counter ? value : ""}
        slots={{
            tooltip: (props) =>
                <CustomChip label={props.children} color={color} {...props} />
        }}
        slotProps={{
            popper: {
                modifiers: [
                    {
                        name: 'offset',
                        options: { offset: [0, 8] }
                    }
                ],
            },
            arrow: {
                sx: { color: palette[color].main }
            }

        }} >
        {children}
    </Tooltip >)
})