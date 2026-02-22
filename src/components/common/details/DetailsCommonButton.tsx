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
    actionType?: "MODIFY" | "CLOSE" | "CREATE" | "DISABLE" | "ENABLE" | "DETAILS" | "NONE",
    handleClick?: () => void,
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to?: string,
    children: ReactNode,
}
export const CommonButton = ({ actionType= "NONE", handleClick, children, ...btnProps }: CommonBtnProps) => {
    return (
        <Button variant="contained" fullWidth onClick={handleClick} {...btnProps}>
            <Stack gap={1} direction="row">
                {actionType === "MODIFY" && <EditIcon />}
                {actionType === "CLOSE" && <CloseIcon />}
                {actionType === "CREATE" && <AddIcon />}
                {actionType === "DISABLE" && <DeleteIcon />}
                {actionType === "ENABLE" && <RestoreFromTrashIcon />}
                {actionType === "DETAILS" && <SearchIcon />}
                {children}
            </Stack>
        </Button>
    )
}