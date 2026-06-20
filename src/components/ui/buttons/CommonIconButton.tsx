import { cloneElement } from "react"
import type { ActionType } from "./ActionIcons"
import { ChipTooltip } from "../details/ChipTooltip"
import ACTION_ICONS from "./ActionIcons"
import type { ColorTypes } from "src/types/mui-theme.d"
import { IconButton, type IconButtonProps } from "@mui/material"
import type { IconProps } from "react-toastify"

interface CommonIconButtonProps extends Omit<IconButtonProps, "color"> {
    actionType?: ActionType,
    title?: string,
    size?: "small" | "medium"
    tooltipSize?: "small" | "medium" | "large" | "xlarge",
    component?: React.ElementType,
    to?: string,
    color?: ColorTypes | "action" | "disabled",
    loading?: boolean
    noTooltip?: boolean,
    border?: boolean
}

export const CommonIconButton = ({ actionType = "NONE", title, color = "action", size = "medium",
    noTooltip = false, tooltipSize = "medium", border = false, loading = false, ...props }: CommonIconButtonProps) => {

    const styleIcon = (actionType: ActionType) => {
        if (actionType === "NONE") return ACTION_ICONS.NONE
        if (actionType === "LOADING") return cloneElement(
            ACTION_ICONS[actionType], { size: (size === "small" ? 18 : 24), color: props.disabled ? "disabled" : color }
        )
        return cloneElement(
            ACTION_ICONS[actionType], { fontSize: size, color: props.disabled ? "gray" : color }
        )
    }

    const actionIcon = loading ? styleIcon("LOADING") : styleIcon(actionType)

    const chipColor = color === "action" ? "primary"
        : color === "disabled" ? "contrast" : color

    const borderStyle = border ? { border: '1px solid', borderColor: 'divider' } : {}

    if (noTooltip) return (
        <IconButton edge="end" aria-label={title} size={size} disabled={loading}
            {...props} sx={{ ...borderStyle, ...props.sx }}>
            {actionIcon}
        </IconButton>
    )

    return (
        <ChipTooltip title={title} color={chipColor} size={tooltipSize}>
            <IconButton edge="end" aria-label={title} size={size} disabled={loading}
                {...props} sx={{ ...borderStyle, ...props.sx }}>
                {actionIcon}
            </IconButton>
        </ChipTooltip>

    )
}

interface CommonIconProps extends Omit<IconProps, "color" | "type" | "theme"> {
    actionType?: ActionType,
    size?: "small" | "medium"
    color?: ColorTypes | "action" | "disabled",
}
export const CommonIcon = ({ actionType = "NONE", color = "action", size = "medium", ...props }: CommonIconProps) => {

    const styleIcon = (actionType: ActionType) => {
        if (actionType === "NONE") return ACTION_ICONS.NONE
        if (actionType === "LOADING") return cloneElement(
            ACTION_ICONS[actionType], { size: (size === "small" ? 18 : 24), color, ...props }
        )
        return cloneElement(
            ACTION_ICONS[actionType], { fontSize: size, color, ...props }
        )
    }

    return styleIcon(actionType)
}