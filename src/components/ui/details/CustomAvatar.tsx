import { Avatar, styled, type AvatarProps } from '@mui/material'
import { getColorShades } from 'src/utils/formatters'

const SIZES = {
    small: { avatar: 36, icon: 24 },
    medium: { avatar: 50, icon: 32 }
}

export const CustomAvatar = styled(
    ({ children, ...props }: AvatarProps) => <Avatar variant="rounded" {...props}>{children}</Avatar>
)(
    ({ theme, color, size = "medium" }) => {
        const iconColorPalette = getColorShades(color ?? "primary", theme)

        return {
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
        }
    }
)