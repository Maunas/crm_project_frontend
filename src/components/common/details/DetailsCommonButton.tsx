import { Stack } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import type { ComponentProps, ReactNode } from 'react';
import type { LinkProps } from 'react-router-dom';
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { styled } from '@mui/material/styles';
import type { ColorTypes } from '../../../types/mui-theme.d';

interface DisableBtnProps {
    active: boolean,
    handleActive: () => void,
    disableColor?: "error" | "success" | "inherit" | "primary" | "secondary" | "info" | "warning",
    disableText?: string,
    enableColor?: "error" | "success" | "inherit" | "primary" | "secondary" | "info" | "warning",
    enableText?: string
}

export const DisableButton = ({ active, handleActive,
    disableColor = "error", disableText = "Deshabilitar",
    enableColor = "success", enableText = "Habilitar", ...btnProps }: DisableBtnProps) => {
    return (<>
        {active ?
            <CommonButton actionType='DISABLE' handleClick={handleActive} variant="outlined" color={disableColor}
                {...btnProps}>
                {disableText}
            </CommonButton>
            : <CommonButton actionType='ENABLE' handleClick={handleActive} variant="outlined" color={enableColor}
                {...btnProps}>
                {enableText}
            </CommonButton>
        }
    </>
    )
}

type MuiButtonProps = ComponentProps<typeof Button>;

interface CommonBtnProps extends MuiButtonProps {
    actionType?: "MODIFY" | "CLOSE" | "CREATE" | "DISABLE" | "ENABLE" | "DETAILS" | "FILTER" | "OPTIONS" | "SAVE" | "NONE",
    handleClick?: () => void,
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to?: string,
    children: ReactNode,
}

const LightButton = styled(Button)(({ theme, color="primary", variant="contained" }) => {
    if (variant !== "outlined") return []
    return [
        theme.applyStyles('dark', {
            color: theme.palette[color as ColorTypes].light
        }
        )]
})

export const CommonButton = ({ actionType = "NONE", handleClick, children, ...btnProps }: CommonBtnProps) => {
    return (
        <LightButton variant="contained" fullWidth onClick={handleClick} {...btnProps}>
            <Stack gap={1} direction="row">
                {actionType === "MODIFY" && <EditIcon fontSize={btnProps.size} />}
                {actionType === "CLOSE" && <CloseIcon fontSize={btnProps.size} />}
                {actionType === "CREATE" && <AddIcon fontSize={btnProps.size} />}
                {actionType === "DISABLE" && <DeleteIcon fontSize={btnProps.size} />}
                {actionType === "ENABLE" && <RestoreFromTrashIcon fontSize={btnProps.size} />}
                {actionType === "DETAILS" && <SearchIcon fontSize={btnProps.size} />}
                {actionType === "SAVE" && <SaveOutlinedIcon fontSize={btnProps.size} />}
                {actionType === "FILTER" && <FilterListIcon fontSize={btnProps.size} />}
                {actionType === "OPTIONS" && <SettingsIcon fontSize={btnProps.size} />}
                {children}
            </Stack>
        </LightButton>
    )
}