import { Button, Stack, Typography } from '@mui/material'
import type { LeadDetailed } from '../../../types/leads'
import { CustomChip } from '../../common/details/StyledDisplayComponents'
import { useState } from 'react'

export const LeadTags = ({ lead }: { lead: LeadDetailed }) => {
    const [open, setOpen] = useState<boolean>(false)


    return (
        <Button fullWidth size='small' onClick={() => setOpen(prev => !prev)}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "start", width: "100%" }}>
                {lead.tags.map(tag =>
                    <CustomChip size='small' color={tag.color} defaultColor="secondary"
                        label={
                            <Typography variant='body2'>{open ? tag.name : tag.name.slice(0, 1)}</Typography>
                        } />
                )}
                {open &&
                    <CustomChip color="primary" size='small'
                        label={
                            <Typography variant='body2'>Agregar</Typography>
                        } />}
            </Stack>
        </Button>
    )
}
