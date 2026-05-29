import React, { memo } from 'react'
import MaterialUISwitch from './ThemeSlider';
import { useUserContext } from 'src/stores/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Divider, FormControlLabel, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { useColorScheme, useTheme } from '@mui/material/styles';
import { AccountCircle, Check } from '@mui/icons-material';
import MoreIcon from '@mui/icons-material/More';
import LoadingScreenWrapper from 'src/components/feedback/LoadingScreen';

const HeaderMenu = memo(() => {
    const nav = useNavigate()

    const { user, logout, activeOrganizations, activeOrg, setActiveOrg, loadingOrgs } = useUserContext()

    const handleLogout = () => {
        logout()
        nav("/login")
    }

    const { setMode } = useColorScheme();
    const { palette } = useTheme();

    const handleMode = (darkMode: boolean) => {
        if (darkMode) return setMode("dark")
        else setMode("light")
    }

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const menuId = 'primary-search-account-menu';
    const renderProfileMenu = (
        <Menu anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            id={menuId} keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem >
                <ListItemText>Organizaciones</ListItemText>
                <Divider />
            </MenuItem>
            <LoadingScreenWrapper loading={loadingOrgs} sx={{ minWidth: "15rem", height: "10rem" }}>
                {
                    activeOrganizations?.map(org => {
                        return <MenuItem dense key={org.id} onClick={() => setActiveOrg(org)}>
                            {org.id === activeOrg?.id &&
                                <ListItemIcon>
                                    <Check />
                                </ListItemIcon>
                            }
                            <ListItemText inset={org.id !== activeOrg?.id} primary={org.name}>
                            </ListItemText>
                        </MenuItem>
                    })
                }
            </LoadingScreenWrapper>
            <Divider />
            <MenuItem >
                <FormControlLabel sx={{ width: "9rem" }}
                    control={<MaterialUISwitch checked={palette.mode === "dark"}
                        onChange={(_, checked) => handleMode(checked)} />}
                    label={palette.mode === "dark" ? "Modo Oscuro" : "Modo Claro"}
                />
            </MenuItem>
            <MenuItem dense onClick={() => handleLogout()} sx={{ "&:hover": { color: palette.error.main } }}>
                <ListItemText>
                    Cerrar Sesión
                </ListItemText>
            </MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >

            <MenuItem onClick={handleProfileMenuOpen}>
                <IconButton
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    color="inherit"
                >
                    <Avatar sx={{ color: palette.secondary.dark, backgroundColor: palette.secondary.light }} />
                </IconButton>
                <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email}</Typography>
                    <Typography variant="body2">{activeOrg?.name}</Typography>
                </Stack>
            </MenuItem>
        </Menu>
    );

    if (user) return (
        <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: "center" }}>
                <Stack>
                    <Typography variant="body2" sx={{ textAlign: "end", fontWeight: 600 }}>{user.email}</Typography>
                    <Typography variant="body2" sx={{ textAlign: "end" }}>{activeOrg?.name}</Typography>
                </Stack>
                <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                >
                    <Avatar sx={{ color: palette.secondary.dark, backgroundColor: palette.secondary.light }} />
                </IconButton>
            </Box>
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                    size="large"
                    aria-label="show more"
                    aria-controls={mobileMenuId}
                    aria-haspopup="true"
                    onClick={handleMobileMenuOpen}
                    color="inherit"
                >
                    <MoreIcon />
                </IconButton>
            </Box>
            {renderMobileMenu}
            {renderProfileMenu}
        </>
    )
    return (<>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            < Button sx={{ color: 'white', borderColor: "white" }} variant='outlined' size='large' component={Link} to="/login" startIcon={<AccountCircle />}> Iniciar Sesión</Button >
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                size="large"
                aria-label="login"
                onClick={handleMobileMenuOpen}
                color="inherit"
                component={Link} to="/login"
            >
                <AccountCircle />
            </IconButton>
        </Box>
    </>)
})

export default HeaderMenu