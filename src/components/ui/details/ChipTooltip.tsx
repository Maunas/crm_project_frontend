import { Tooltip, type PopperPlacementType } from "@mui/material"
import CustomChip from "./CustomProgressBar"
import { memo, type ReactElement } from "react"
import { useTheme } from "@mui/material/styles"
import type { ColorTypes } from "../../../types/mui-theme.d"

interface ChipTooltipProps {
    show?: boolean,
    title: string,
    color?: ColorTypes,
    children: ReactElement,
    placement?: PopperPlacementType,
    size?: "small" | "medium" | "large" | "xlarge"
}

export const ChipTooltip = memo(({ show = true, placement = "top", title, color = "primary", size = "medium", children }: ChipTooltipProps) => {

    const { palette } = useTheme()

    if (!show) return children

    return (<Tooltip arrow placement={placement} title={title}
        slots={{
            tooltip: (props) =>
                <CustomChip label={props.children} color={color} size={size} {...props} />
        }}
        slotProps={{
            popper: {
                modifiers: [
                    {
                        name: 'offset',
                        options: { offset: [0, size === "medium" ? 8 : 4] }
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