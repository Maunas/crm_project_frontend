import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export const ACTION_ICONS = {
    NONE: <></>,
    MODIFY: <EditIcon />,
    CLOSE: <CloseIcon />,
    CREATE: <AddIcon />,
    DISABLE: <DeleteIcon />,
    ENABLE: <RestoreFromTrashIcon />,
    DETAILS: <SearchIcon />,
    SAVE: <SaveOutlinedIcon />,
    FILTER: <FilterListIcon />,
    OPTIONS: <SettingsIcon />,
    RETURN: <ArrowBackIcon />,
    LOGIN: <PersonIcon />,
    SIGNUP: <PersonAddIcon />,
    LIST: <FormatListBulletedIcon />,
    CHECK: <TaskAltIcon />,
}

export type ActionType = "MODIFY" | "CLOSE" | "CREATE" | "DISABLE" | "ENABLE" |
    "DETAILS" | "FILTER" | "OPTIONS" | "SAVE" | "RETURN" |
    "LOGIN" | "SIGNUP" | "NONE" | "LIST" | "CHECK"