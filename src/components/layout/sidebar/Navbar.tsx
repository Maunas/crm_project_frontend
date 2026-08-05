import { memo, useMemo } from 'react';
import { ChipTooltip } from 'shared/ui/details/ChipTooltip';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles';
import { useUserContext } from 'src/stores/UserContext';
import { GLOBAL_NAVBAR, REGULAR_NAVBAR } from 'src/routing/routeListExports';

interface NavbarProps {
  open: boolean
}

const Navbar = memo(({ open }: NavbarProps) => {
  const { palette } = useTheme()
  const { pathname } = useLocation()
  const { activeOrg, hasPermission } = useUserContext()

  const options = useMemo(() =>
    (activeOrg?.id === 1 ? GLOBAL_NAVBAR : REGULAR_NAVBAR)
      .filter(op => !op.permission || (Array.isArray(op.permission) ? op.permission.some(hasPermission) : hasPermission(op.permission))),
    [activeOrg, hasPermission]
  )

  const activeIdx = useMemo(() =>
    options.findIndex(op =>
      pathname === op.path || pathname.split("/")[1] === op.path.slice(1)
    )
    , [pathname, options])

  const LIST_ITEM_STYLES = useMemo(() =>
    options.map((_, idx) => [
      {
        display: 'block',
        "&:hover": { backgroundColor: palette.contrast.light }
      },
      activeIdx === idx ? { backgroundColor: alpha(palette.primary.main, .4) } : {}
    ]), [palette, activeIdx, options])

  const ITEM_STYLES = useMemo(() => [
    { minHeight: 48, px: 2.5, },
    open ? { justifyContent: 'initial', } : { justifyContent: 'center', },
  ], [open])

  const ICON_STYLES = useMemo(() => [
    { color: palette.contrast.contrastText, minWidth: 0, justifyContent: 'center' },
    open ? { mr: 3, } : { mr: 'auto', },
  ], [open, palette])

  const VISIBILITY = useMemo(() => [
    { opacity: open ? 1 : 0, },
  ], [open])

  return (
    <List>
      {options?.map((item, idx) => (
        <ChipTooltip key={item.title} placement='right' title={open ? "" : item.title}>
          <ListItem disablePadding sx={LIST_ITEM_STYLES[idx]}>
            <ListItemButton
              component={Link} to={item.path} sx={ITEM_STYLES} >
              <ListItemIcon sx={ICON_STYLES}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.navTitle ?? item.title} sx={VISIBILITY} />
            </ListItemButton>
          </ListItem>
        </ChipTooltip>
      ))}
    </List>
  )
})

export default Navbar
