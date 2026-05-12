import { ListItem, ListItemAvatar } from '@mui/material'
import { alpha, lighten, styled } from '@mui/material/styles'

/**
 * Solo muestra los secondaryAction si se está haciendo hover.
 */
export const CustomListItem = styled(ListItem)(
    ({ selected = false, theme }) => {
        const selectedStyle = selected ?
            [
                {
                    borderRadius: ".5rem",
                    backgroundColor: lighten(theme.palette.background.paper, .3),
                    boxShadow: `0 2px 6px -1px ${alpha(theme.palette.primary.dark, .6)}`,
                },
                theme.applyStyles("dark", {
                    backgroundColor: lighten(theme.palette.background.paper, .15),
                    boxShadow: `0 2px 6px -1px ${alpha(theme.palette.primary.main, .4)}`,
                })
            ] : {}

        return [
            selectedStyle,
            {
                "& .MuiListItem-secondaryAction": {
                    display: "none"
                },
                "&:hover .MuiListItem-secondaryAction": {
                    display: "block"
                },
            }]
    }
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