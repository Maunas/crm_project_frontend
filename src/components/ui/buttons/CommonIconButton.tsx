import { cloneElement } from "react"
import type { ActionType } from "./ActionIcons"
import { ChipTooltip } from "../details/ChipTooltip"
import ACTION_ICONS from "./ActionIcons"
import type { ColorTypes } from "src/types/mui-theme.d"
import { IconButton, type IconButtonProps } from "@mui/material"

interface CommonIconButtonProps extends Omit<IconButtonProps, "color"> {
    actionType?: ActionType,
    title: string,
    size?: "small" | "medium"
    tooltipSize?: "small" | "medium" | "large" | "xlarge",
    component?: React.ElementType,
    to?: string,
    color?: ColorTypes,
    loading?: boolean
}

export const CommonIconButton = ({ actionType = "NONE", title, color, size = "medium", tooltipSize = "medium", loading = false, ...props }: CommonIconButtonProps) => {

    const styleIcon = (actionType: ActionType) => {
        if (actionType === "NONE") return ACTION_ICONS.NONE
        if (actionType === "LOADING") return cloneElement(
            ACTION_ICONS[actionType], { size: (size === "small" ? 18 : 24), color: color }
        )
        return cloneElement(
            ACTION_ICONS[actionType], { fontSize: size, color: color }
        )
    }

    const actionIcon = loading ? styleIcon("LOADING") : styleIcon(actionType)

    return (
        <ChipTooltip title={title} color={color ?? "secondary"} size={tooltipSize}>
            <IconButton edge="end" aria-label={title} size={size} disabled={loading} {...props}>
                {actionIcon}
            </IconButton>
        </ChipTooltip>

    )
}