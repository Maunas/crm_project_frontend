import { Link } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import StoreIcon from '@mui/icons-material/Store';
import LabelIcon from '@mui/icons-material/Label';
import { ChipTooltip } from '../details/ChipTooltip';

interface NavbarProps {
  open: boolean
}

export const Navbar = ({ open }: NavbarProps) => {

  const theme = useTheme()

  const options = [
    { name: "Leads", icon: <PersonIcon />, link: "/leads" },
    { name: "Campañas", icon: <WorkIcon />, link: "/campaigns" },
    { name: "Organizaciones", icon: <StoreIcon />, link: "/organizations" },
    { name: "Nomencladores", icon: <LabelIcon />, link: "/nomenclators" },
  ]

  return (
    <List>
      {options?.map((item) => (
        <ListItem key={item.name} disablePadding sx={{
          display: 'block',
          "&:hover": { backgroundColor: theme.palette.contrast.light }
        }}>
          <ChipTooltip placement='right' counter value={item.name}>
            <ListItemButton
              component={Link} to={item.link} title={item.name}
              sx={[
                { minHeight: 48, px: 2.5, },
                open ? { justifyContent: 'initial', } : { justifyContent: 'center', },
              ]}
            >
              <ListItemIcon
                sx={[
                  { color: theme.palette.contrast.contrastText, minWidth: 0, justifyContent: 'center', },
                  open ? { mr: 3, } : { mr: 'auto', },
                ]}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                sx={{ opacity: open ? 1 : 0, }}
              />
            </ListItemButton>
          </ChipTooltip>
        </ListItem>

      ))}
    </List>
  )
}
