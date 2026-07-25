import { Avatar, styled, type AvatarOwnProps } from '@mui/material'
import { getColorShades } from 'src/utils/formatters'

const SIZES = {
    small: { avatar: 36, icon: 24 },
    medium: { avatar: 50, icon: 32 }
}

interface CustomAvatarProps extends AvatarOwnProps {
    color?: string
    ring?: boolean
    ringColor?: string
    size?: "small" | "medium"
}

const CustomAvatarRoot = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== "color" && prop !== "ring" && prop !== "ringColor" && prop !== "size",
})<CustomAvatarProps>(
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
            outlineOffset: "1px",
            outline: `2px solid ${ringPalette?.MAIN ?? iconColorPalette.MAIN}`,
            ...theme.applyStyles("dark", {
                outline: `2px solid ${ringPalette?.DARK ?? iconColorPalette.DARK}`,
            })
        } : {}]
    }
)

export const CustomAvatar = ({ children, ...props }: CustomAvatarProps) => {
    return <CustomAvatarRoot variant="rounded" {...props}>{children}</CustomAvatarRoot>
}