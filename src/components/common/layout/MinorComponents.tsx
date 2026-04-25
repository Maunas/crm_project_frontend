import Stack from '@mui/material/Stack'
import { CustomChip } from '../details/StyledDisplayComponents'

interface DetailsTitleProps {
    active: boolean,
    children?: React.ReactNode,
}

export const TitleAndActive = ({ active, children }: DetailsTitleProps) => {
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", width: "100%", flexGrow: 1 }}>
            {children}
            {
                active ? <CustomChip sx={{ marginLeft: "auto" }} color='success' label="Habilitado" /> :
                    <CustomChip sx={{ marginLeft: "auto" }} color='error' label="Deshabilitado" />
            }
        </Stack >
    )
}
