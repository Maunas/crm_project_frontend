import { memo, useMemo } from 'react';
import { ChipTooltip } from 'shared/ui/details/ChipTooltip';
import { Link, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import LabelIcon from '@mui/icons-material/Label';
import WorkIcon from '@mui/icons-material/Work';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import { useUserContext } from 'src/stores/UserContext';
import { LEAD_PROPERTIES } from 'features/orgProperties/orgPropertiesList';

//"permission" es el codename que hace falta para ver la sección (ver RequirePermission.tsx, mismo mapeo que routes.tsx).
//Si no tiene "permission", se muestra a cualquier usuario logueado.
const regularOptions = [
  { name: "Dashboard", icon: <DashboardIcon />, link: "/dashboard" },
  { name: "Leads", icon: <PersonIcon />, link: "/leads", permission: "lead:view" },
  { name: "Campañas", icon: <WorkIcon />, link: "/campaigns", permission: "workspace:view" },
  { name: "Equipos", icon: <GroupIcon />, link: "/teams", permission: "team:view" },
  { name: "Organizaciones", icon: <StoreIcon />, link: "/organizations", permission: "organization:view" },
  { name: "Nomencladores", icon: <LabelIcon />, link: "/nomenclators", permission: "nomenclator:view" },
  { name: "Propiedades de Organización", icon: <TuneIcon />, link: "/org-properties", permission: LEAD_PROPERTIES.map(prop => prop.permission) },
  { name: "Automatizaciones", icon: <AutoFixHighIcon />, link: "/automations", permission: "field_automation:view" },
  { name: "Auditoría de Sistema", icon: <VerifiedUserIcon />, link: "/audit-logs", permission: "system_audit_log:view" }
]

const globalOptions = [
  { name: "Dashboard", icon: <DashboardIcon />, link: "/dashboard" },
  { name: "Organizaciones", icon: <StoreIcon />, link: "/organizations", permission: "organization:view" },
  { name: "Usuarios", icon: <GroupIcon />, link: "/users", permission: "user:view_all" },
  { name: "Auditoría de Sistema", icon: <VerifiedUserIcon />, link: "/audit-logs", permission: "system_audit_log:view" }
]

interface NavbarProps {
  open: boolean
}

const Navbar = memo(({ open }: NavbarProps) => {
  const { palette } = useTheme()
  const { pathname } = useLocation()
  const { activeOrg, hasPermission } = useUserContext()

  const options = useMemo(() =>
    (activeOrg?.id === 1 ? globalOptions : regularOptions)
      .filter(op => !op.permission || (Array.isArray(op.permission) ? op.permission.some(hasPermission) : hasPermission(op.permission))),
    [activeOrg, hasPermission]
  )

  const activeIdx = useMemo(() =>
    options.findIndex(op =>
      pathname === op.link || pathname.split("/")[1] === op.link.slice(1)
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
        <ChipTooltip key={item.name} placement='right' title={open ? "" : item.name}>
          <ListItem disablePadding sx={LIST_ITEM_STYLES[idx]}>
            <ListItemButton
              component={Link} to={item.link} title={item.name}
              sx={ITEM_STYLES} >
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

export default Navbar
