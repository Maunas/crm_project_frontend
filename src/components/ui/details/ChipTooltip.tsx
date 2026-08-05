import { memo, type ReactElement, type ReactNode } from "react"
import CustomChip from "./CustomChip"
import { Box, Tooltip, type PopperPlacementType, type TooltipProps } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { getColorShades } from "src/utils/formatters"

interface ChipTooltipProps extends TooltipProps {
    show?: boolean,
    boxed?: boolean,
    title: ReactNode,
    color?: string,
    placement?: PopperPlacementType,
    size?: "small" | "medium" | "large" | "xlarge"
    children: ReactElement,
}

export const ChipTooltip = memo(({ show = true, boxed = false, title, color = "primary", placement = "top", size = "medium", children, ...props }: ChipTooltipProps) => {

    const theme = useTheme()
    const chipColor = getColorShades(color, theme)


    if (!show || !title) return children

    return (<Tooltip arrow placement={placement} title={<Box sx={{ fontWeight: 500 }} {...props}>{title}</Box>}
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
                sx: { color: chipColor.MAIN }
            }
        }} >
        {boxed ? <Box sx={{ p: 0, m: 0, display: "inline-flex" }}>{children}</Box> : children}
    </Tooltip >)
})