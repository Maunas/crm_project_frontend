import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import StoreIcon from '@mui/icons-material/Store';
import LabelIcon from '@mui/icons-material/Label';
import { ChipTooltip } from '../details/ChipTooltip';
import { memo, useMemo } from 'react';
import { alpha } from '@mui/material/styles';

const options = [
  { name: "Leads", icon: <PersonIcon />, link: "/leads" },
  { name: "Campañas", icon: <WorkIcon />, link: "/campaigns" },
  { name: "Organizaciones", icon: <StoreIcon />, link: "/organizations" },
  { name: "Nomencladores", icon: <LabelIcon />, link: "/nomenclators" },
]

interface NavbarProps {
  open: boolean
}

export const Navbar = memo(({ open }: NavbarProps) => {

  const { palette } = useTheme()

  const { pathname } = useLocation()

  const activeIdx = useMemo(() =>
    options.findIndex(op =>
      pathname.split("/")[1] === op.link.slice(1)
    )
    , [pathname])

  const LIST_ITEM_STYLES = useMemo(() =>
    options.map((_, idx) => [
      {
        display: 'block',
        "&:hover": { backgroundColor: palette.contrast.light }
      },
      activeIdx === idx ? { backgroundColor: alpha(palette.primary.main, .4) } : {}
    ]), [palette, activeIdx])

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
        <ChipTooltip key={item.name} placement='right' title={open ? "" : item.name}>
          <ListItem disablePadding sx={LIST_ITEM_STYLES[idx]}>
            <ListItemButton
              component={Link} to={item.link} title={item.name}
              sx={ITEM_STYLES}
            >
              <ListItemIcon sx={ICON_STYLES}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name} sx={VISIBILITY}
              />
            </ListItemButton>
          </ListItem>
        </ChipTooltip>
      ))}
    </List>
  )
})
