import { Avatar, styled, type AvatarProps } from '@mui/material'
import { getColorPalette } from 'src/utils/formatters'

export const CustomAvatar = styled(
    ({ children, ...props }: AvatarProps) => <Avatar variant="rounded" {...props}>{children}</Avatar>
)(
    ({ theme, color }) => {
        const iconColorPalette = getColorPalette(color ?? "primary", theme)

        return {
            width: 50, height: 50,
            color: iconColorPalette.DARKER,
            backgroundColor: theme.alpha(iconColorPalette.LIGHTER, .8),
            "& .MuiSvgIcon-root": {
                width: 32, height: 32,
            },
            ...theme.applyStyles("dark", {
                color: iconColorPalette.LIGHTER,
                backgroundColor: theme.alpha(iconColorPalette.DARKER, .6),
            })
        }
    }
)