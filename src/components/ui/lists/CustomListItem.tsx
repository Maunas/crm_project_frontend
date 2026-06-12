import { ListItem, ListItemAvatar, Paper, type ListItemOwnProps } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import type { ColorTypes } from 'src/types/mui-theme.d'

/**
 * Solo muestra los secondaryAction si se está haciendo hover.
 */
export const CustomListItem = styled(
    ({ isSelected = false, ...props }: ListItemOwnProps) => {
        console.log("selected:", isSelected)
        return <ListItem
            {...(isSelected ? { component: Paper, elevation: 7, "data-noborder": true } : {})}
            {...props}
        >
            {props.children}
        </ListItem>
    },
    {
        shouldForwardProp: (prop) =>
            prop !== "alwaysShowSecondary" && prop !== "isSelected ",
    }
)(
    ({ isSelected = false, alwaysShowSecondary = false, theme, color }) => {
        const colorType = color ? color as ColorTypes : "primary"
        const selectedStyle = isSelected ?
            [
                {
                    borderRadius: ".5rem",
                    border: `2px solid ${alpha(theme.palette[colorType].dark, .6)}`,
                },
                theme.applyStyles("dark", {
                    border: `2px solid ${alpha(theme.palette[colorType].main, .4)}`,
                })
            ] : {}


        return [
            selectedStyle,
            (!alwaysShowSecondary && {
                "& .MuiListItem-secondaryAction": {
                    display: "none"
                },
                "&:hover .MuiListItem-secondaryAction": {
                    display: "block"
                },
            })
        ]
    }
)

export const CustomListItemAvatar = styled(ListItemAvatar)(
    ({ theme, color = "primary" }) => [
        {
            minWidth: "3rem",
            "& .MuiAvatar-root": {
                backgroundColor: alpha(theme.palette[color].light, .2),
                color: theme.palette[color].dark
            },
        },
        theme.applyStyles("dark", {
            "& .MuiAvatar-root": {
                backgroundColor: alpha(theme.palette[color].dark, .2),
                color: theme.palette[color].light
            },
        })
    ]
)