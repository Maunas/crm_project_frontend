import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import LabelIcon from '@mui/icons-material/Label';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StoreIcon from '@mui/icons-material/Store';
import TuneIcon from '@mui/icons-material/Tune';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import FindInPageIcon from '@mui/icons-material/FindInPage';

const ROUTE_ICONS = {
    DASHBOARD: <DashboardIcon />,
    LEADS: <PersonIcon />,
    CAMPAIGNS: <WorkIcon />,
    NOMENCLATORS: <LabelIcon />,
    AUTOMATIONS: <AutoFixHighIcon />,
    ORGANIZATIONS: <StoreIcon />,
    ORG_PROPERTIES: <TuneIcon />,
    ROLES: <LockIcon />,
    TEAMS: <GroupIcon />,
    AUDIT: <FindInPageIcon />,
}

export type RouteType = keyof typeof ROUTE_ICONS

export default ROUTE_ICONS
