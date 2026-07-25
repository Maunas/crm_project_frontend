import { useMemo, useRef, useState } from 'react'
import { CommonIcon, CommonIconButton } from '../buttons/CommonIconButton'
import type { ActionType } from '../buttons/ActionIcons'
import type { ColorTypes } from 'src/types/mui-theme.d'
import { IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Stack, useMediaQuery, type ListItemOwnProps } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * Solo muestra los secondaryAction si se está haciendo hover.
 */
export const CustomListItem = styled(
    ({ isSelected = false, ...props }: ListItemOwnProps) => {
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
            {
                "& .MuiListItemText-primary .MuiTypography-root": {
                    fontWeight: 500,
                },
            },
            ((!alwaysShowSecondary) && {
                "& .MuiListItem-secondaryAction": {
                    visibility: "hidden",
                },
                "&:hover .MuiListItem-secondaryAction": {
                    visibility: "visible",
                },
            })
        ]
    }
)
interface ResponsiveListItemProps extends ListItemOwnProps {
    size?: "small" | "medium"
    actions: (ListItemAction | false | null | undefined)[],
    onClick?: () => unknown,
    component?: React.ElementType,
    to?: string,
}
/**
 * Solo muestra los secondaryAction si se está haciendo hover.
 */
export const ResponsiveListItem = ({ size = "small", actions, children, onClick, component, to, ...props }: ResponsiveListItemProps) => {
    const isTouchDevice = useMediaQuery('(pointer: coarse)')
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const menuButton = useRef(null)
    const showMenu = isTouchDevice && actions.length > 1

    const processedActions = useMemo(() =>
        buildActions(...actions)
        , [actions])

    const handleItemClick = () => {
        if (showMenu) return { onClick: () => setAnchorEl(menuButton.current) } //Si es responsive, muestra menú
        if (onClick) return { onClick } //Si tiene onClick, lo ejecuta
        if (component && to) return { component, to } //Si tiene component y to, los define
        return {}
    }
    return <CustomListItem sx={{ height: "100%" }}
        alwaysShowSecondary={isTouchDevice} {...props}
        secondaryAction={showMenu ?
            <>
                <IconButton size={size} ref={menuButton} onClick={e => setAnchorEl(e.currentTarget)} sx={{ mr: -1 }}>
                    <MoreVertIcon fontSize={size} />
                </IconButton>
                <ListActionMenu actions={processedActions} anchorEl={anchorEl} closeMenu={() => setAnchorEl(null)} />
            </>
            :
            <Stack direction="row" sx={{ mr: -1 }}>
                {processedActions.map(action => (
                    <CommonIconButton actionType={action.actionType} key={action.label} title={action.label}
                        onClick={action.onClick} component={action.component} to={action.to} color={action.color ?? "action"} size={size} tooltipSize={size} />
                ))}
            </Stack>}>
        <ListItemButton {...handleItemClick()}
            sx={{ height: "100%", "&&": { pr: showMenu ? 5 : processedActions.length * 3 + 2 } }} >
            {children}
        </ListItemButton>
    </CustomListItem>
}


interface ListItemActionView {
    actionType?: ActionType
    label?: string
    color?: ColorTypes | "action"
}

export interface ListItemAction extends ListItemActionView {
    onClick?: () => void
    component?: React.ElementType,
    to?: string,
    template?: keyof typeof ACTION_TEMPLATES
}

const ACTION_TEMPLATES = {
    DETAILS: { actionType: "DETAILS", label: "Detalle" } as ListItemActionView,
    MODIFY: { actionType: "MODIFY", label: "Modificar" } as ListItemActionView,
    ENABLE: { actionType: "ENABLE", label: "Habilitar", color: "success" } as ListItemActionView,
    DISABLE: { actionType: "DISABLE", label: "Deshabilitar", color: "error" } as ListItemActionView,
    DELETE: { actionType: "DISABLE", label: "Eliminar", color: "error" } as ListItemActionView,
}

//Filtra valores inválidos, y, si tiene un template, completa los templates comunes
export function buildActions(...items: (ListItemAction | false | null | undefined)[]): ListItemAction[] {
    return items
        .filter((a): a is ListItemAction => Boolean(a))
        .map((i) => {
            if (i.template) return { ...ACTION_TEMPLATES[i.template], ...i }
            else return i
        })
}

interface ActionGroupProps {
    actions: ListItemAction[],
    anchorEl: HTMLElement | null,
    closeMenu: () => unknown
}

/**
 * Menú desplegable de acciones (ícono + texto por opción). Usado internamente por
 * `ResponsiveListItem` para su modo táctil ("..." en vez de íconos sueltos), pero también se
 * exporta suelto para cualquier otro botón de "tres puntos" de la app que necesite el mismo
 * desplegable sin todo el resto de `ResponsiveListItem` (ej. el menú de acciones del detalle de Lead).
 */
export const ListActionMenu = ({ actions, anchorEl, closeMenu }: ActionGroupProps) => {

    return (
        <>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}>
                {actions.map(action => (
                    <MenuItem key={action.label} dense
                        onClick={() => {
                            if (action.onClick) action.onClick()
                            closeMenu()
                        }}
                        {...(action.component ? { component: action.component, to: action.to } : {})}
                    >
                        <ListItemIcon color={action.color ?? "action"} >
                            <CommonIcon actionType={action.actionType} color={action.color ?? "action"} />
                        </ListItemIcon>
                        <ListItemText>{action.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}

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