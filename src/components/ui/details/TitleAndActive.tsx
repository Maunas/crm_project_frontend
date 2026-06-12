import { EnabledIcon } from '../lists/Icons'
import Stack, { type StackProps } from '@mui/material/Stack'

interface DetailsTitleProps extends StackProps {
    active: boolean,
    children?: React.ReactNode,
}

const TitleAndActive = ({ active, children, ...props }: DetailsTitleProps) => {
    return (
        <Stack direction="row" spacing={1}  {...props}
            sx={{ justifyContent: "start", alignItems: "center", ...props.sx }}>
            <EnabledIcon active={active} />
            {children}
        </Stack >
    )
}

export default TitleAndActive