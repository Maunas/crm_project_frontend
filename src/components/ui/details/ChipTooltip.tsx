import { memo, type ReactElement, type ReactNode } from "react"
import CustomChip from "./CustomChip"
import type { ColorTypes } from "src/types/mui-theme.d"
import { Box, Tooltip, type PopperPlacementType } from "@mui/material"
import { useTheme } from "@mui/material/styles"

interface ChipTooltipProps {
    show?: boolean,
    boxed?: boolean,
    title: ReactNode,
    color?: ColorTypes,
    placement?: PopperPlacementType,
    size?: "small" | "medium" | "large" | "xlarge"
    children: ReactElement,
}

export const ChipTooltip = memo(({ show = true, boxed = false, title, color = "primary", placement = "top", size = "medium", children }: ChipTooltipProps) => {

    const { palette } = useTheme()

    if (!show) return children

    return (<Tooltip arrow placement={placement} title={<Box sx={{ fontWeight: 500 }}>{title}</Box>}
        slots={{
            tooltip: (props) =>
                <CustomChip label={props.children} chipColor={color} size={size} {...props} />
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
        {boxed ? <Box sx={{ p: 0, m: 0, display: "inline-flex" }}>{children}</Box> : children}
    </Tooltip >)
})