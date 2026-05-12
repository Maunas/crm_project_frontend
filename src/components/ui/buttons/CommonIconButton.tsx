import { cloneElement } from "react"
import type { ActionType } from "./ActionIcons"
import { ChipTooltip } from "../details/ChipTooltip"
import ACTION_ICONS from "./ActionIcons"
import type { ColorTypes } from "src/types/mui-theme.d"
import type { LinkProps } from "react-router-dom"
import { IconButton, type IconButtonProps } from "@mui/material"

interface CommonIconButtonProps extends Omit<IconButtonProps, "color"> {
    actionType?: ActionType,
    title: string,
    size?: "small" | "medium"
    tooltipSize?: "small" | "medium" | "large" | "xlarge",
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to?: string,
    color?: ColorTypes
}

export const CommonIconButton = ({ actionType = "NONE", title, color, size = "medium", tooltipSize = "medium", ...props }: CommonIconButtonProps) => {
    return (
        <ChipTooltip title={title} color={color ?? "secondary"} size={tooltipSize}>
            <IconButton edge="end" aria-label={title} size={size} {...props}>
                {cloneElement(ACTION_ICONS[actionType], { fontSize: size, color: color })}
            </IconButton>
        </ChipTooltip>

    )
}