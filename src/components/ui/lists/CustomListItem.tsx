import { ListItem, ListItemAvatar } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'

/**
 * Solo muestra los secondaryAction si se está haciendo hover.
 */
export const CustomListItem = styled(ListItem)(
    () => [
        {
            "& .MuiListItem-secondaryAction": {
                display: "none"
            },
            "&:hover .MuiListItem-secondaryAction": {
                display: "block"
            }
        }
    ]
)

export const CustomListItemAvatar = styled(ListItemAvatar)(
    ({ theme, color = "primary" }) => [
        {
            minWidth: "3rem",
            "& .MuiAvatar-root": {
                borderRadius: ".5rem",
                backgroundColor: alpha(theme.palette[color].light, .2),
                color: theme.palette[color].dark
            },
        },
        theme.applyStyles("dark", {
            "& .MuiAvatar-root": {
                borderRadius: ".5rem",
                backgroundColor: alpha(theme.palette[color].dark, .2),
                color: theme.palette[color].light
            },
        })
    ]
)