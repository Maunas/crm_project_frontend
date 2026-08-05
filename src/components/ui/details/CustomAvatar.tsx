import { Avatar, styled, type AvatarOwnProps } from '@mui/material'
import { getColorShades } from 'src/utils/formatters'
import { ChipTooltip } from './ChipTooltip'
import type { ReactNode } from 'react'
import { EnabledIcon } from '../lists/Icons'

const SIZES = {
    small: { avatar: 36, icon: 24 },
    medium: { avatar: 50, icon: 32 }
}

interface CustomAvatarRootProps extends AvatarOwnProps {
    color?: string
    ring?: boolean
    ringColor?: string
    size?: "small" | "medium"
}

const CustomAvatarRoot = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== "color" && prop !== "ring" && prop !== "ringColor" && prop !== "size",
})<CustomAvatarRootProps>(
    ({ theme, color, size = "medium", ring = false, ringColor }) => {
        const iconColorPalette = getColorShades(color ?? "primary", theme)
        const ringPalette = ringColor ? getColorShades(ringColor, theme) : undefined

        return [{
            width: SIZES[size].avatar, height: SIZES[size].avatar,
            color: iconColorPalette.DARKER,
            backgroundColor: theme.alpha(iconColorPalette.LIGHTER, .8),
            "& .MuiSvgIcon-root": {
                width: SIZES[size].icon, height: SIZES[size].icon,
            },
            ...theme.applyStyles("dark", {
                color: iconColorPalette.LIGHTER,
                backgroundColor: theme.alpha(iconColorPalette.DARKER, .6),
            })
        },
        ring ? {
            outlineOffset: `${size === "small" ? "1px" : "3px"}`,
            outline: `2px solid ${ringPalette?.MAIN ?? iconColorPalette.MAIN}`,
            ...theme.applyStyles("dark", {
                outline: `2px solid ${theme.alpha(ringPalette?.DARK ?? iconColorPalette.DARK, .8)}`,
            })
        } : {}]
    }
)

interface CustomAvatarProps extends CustomAvatarRootProps {
    tooltipText?: string
}
export const CustomAvatar = ({ children, tooltipText, ...props }: CustomAvatarProps) => {
    const tooltipColor = props.ringColor ?? props.color

    if (tooltipText) return (
        <ChipTooltip title={tooltipText} color={tooltipColor}>
            <CustomAvatarRoot variant="rounded" {...props}>{children}</CustomAvatarRoot>
        </ChipTooltip>
    )
    else return (
        <CustomAvatarRoot variant="rounded" {...props}>{children}</CustomAvatarRoot>
    )
}


interface CustomAvatarEnabledProps extends AvatarOwnProps {
    active: boolean,
    size?: "small" | "medium"
    overrideColor?: string
    overrideRingColor?: string
    overrideIcon?: ReactNode
    overrideTooltip?: string
}
export const CustomAvatarEnabled = ({ active, overrideColor, overrideRingColor, overrideIcon, overrideTooltip, ...props }: CustomAvatarEnabledProps) => {

    const color = overrideColor ?? (active ? "success" : "error")
    const ringColor = overrideRingColor ?? (active ? "success" : "error")
    const icon = overrideIcon ?? <EnabledIcon active={active} isAvatar noTooltip />
    const title = overrideTooltip ?? (active ? "Habilitado" : "Deshabilitado")

    return <ChipTooltip color={ringColor} title={title} >
        <CustomAvatarRoot variant="rounded" color={color} ring ringColor={ringColor} {...props}>
            {icon}
        </CustomAvatarRoot>
    </ChipTooltip>
}