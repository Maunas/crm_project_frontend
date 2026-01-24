import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from 'react-router-dom';

interface NavbarProps {
  open: boolean
}

export const Navbar = ({ open }: NavbarProps) => {
  const options = [
    { name: "Leads", icon: <PersonIcon />, link:"/leads" },
    { name: "Campañas", icon: <WorkIcon />, link:"/campaigns" },
    { name: "Reportes", icon: <SsidChartIcon />, link:"" },
    { name: "Personalizaciones", icon: <SettingsIcon />, link:"" },
  ]

  return (
    <List>
      {options?.map((item) => (
        <ListItem key={item.name} disablePadding sx={{ display: 'block' }}>
          <ListItemButton
          component={Link} to={item.link}
            sx={[
              { minHeight: 48, px: 2.5, },
              open ? { justifyContent: 'initial', } : { justifyContent: 'center', },
            ]}
          >
            <ListItemIcon
              sx={[
                { minWidth: 0, justifyContent: 'center', },
                open ? { mr: 3, } : { mr: 'auto', },
              ]}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              sx={[ open ? { opacity: 1, } : { opacity: 0, },
              ]}
            />
          </ListItemButton>
        </ListItem>

      ))}
    </List>
  )
}
