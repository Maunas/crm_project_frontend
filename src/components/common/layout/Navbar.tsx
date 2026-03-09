import { Link } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';

interface NavbarProps {
  open: boolean
}

export const Navbar = ({ open }: NavbarProps) => {

  const theme = useTheme()

  const options = [
    { name: "Leads", icon: <PersonOutlinedIcon />, link: "/leads" },
    { name: "Campañas", icon: <WorkOutlineOutlinedIcon />, link: "/campaigns" },
    { name: "Reportes", icon: <StoreOutlinedIcon />, link: "/organizations" },
    { name: "Nomencladores", icon: <LabelOutlinedIcon />, link: "/nomenclators" },
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
                { color: theme.palette.primary.contrastText, minWidth: 0, justifyContent: 'center', },
                open ? { mr: 3, } : { mr: 'auto', },
              ]}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name}
              sx={[open ? { opacity: 1, } : { opacity: 0, },
              ]}
            />
          </ListItemButton>
        </ListItem>

      ))}
    </List>
  )
}
