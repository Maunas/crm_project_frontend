import { ListItem, styled } from '@mui/material'

export const CustomListItem = styled(ListItem)(
    () => {
        return [
            {
                "& .MuiListItem-secondaryAction": {
                    display: "none"
                },
                "&:hover .MuiListItem-secondaryAction": {
                    display: "block"
                }
            }
        ]
    }
)