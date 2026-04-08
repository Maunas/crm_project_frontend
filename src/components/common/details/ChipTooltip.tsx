import { Tooltip } from "@mui/material"
import { CustomChip } from "./StyledDisplayComponents"
import type { ReactElement } from "react"
import { useTheme } from "@mui/material/styles"
import type { ColorTypes } from "../../../types/mui-theme.d"

interface ChipTooltip {
    size: "small" | "medium",
    counter: boolean,
    value: string,
    color?: ColorTypes,
    children: ReactElement
}

export const ChipTooltip = ({ size, counter, value, color = "secondary", children }: ChipTooltip) => {

    const { palette } = useTheme()

    return (<Tooltip arrow placement="top" title={size === "small" && counter ? value : ""}
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
}