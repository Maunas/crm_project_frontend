import { EnabledIcon } from '../lists/Icons'
import Stack, { type StackProps } from '@mui/material/Stack'
import { CustomAvatar } from './CustomAvatar'

interface DetailsTitleProps extends StackProps {
    active: boolean,
    children?: React.ReactNode,
}

const TitleAndActive = ({ active, children, ...props }: DetailsTitleProps) => {
    return (
        <Stack direction="row" spacing={2}  {...props}
            sx={{ justifyContent: "start", alignItems: "center", ...props.sx }}>
            <CustomAvatar color={active ? "success" : "error"}>
                <EnabledIcon active={active} isAvatar />
            </CustomAvatar>
            {children}
        </Stack >
    )
}

export default TitleAndActive