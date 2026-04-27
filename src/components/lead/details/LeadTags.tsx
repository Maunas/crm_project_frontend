import { Button, Stack } from '@mui/material'
import type { LeadDetailed } from '../../../types/leads'
import { CustomChip } from '../../common/details/StyledDisplayComponents'
import { useState } from 'react'

export const LeadTags = ({ lead }: { lead: LeadDetailed }) => {
    const [open, setOpen] = useState<boolean>(false)


    return (
        <Stack direction="row" spacing={.5} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "start", width: "100%" }}>
            {lead.tags.map(tag =>
                <Button sx={{ p: 0, minWidth: 0 }} size="small" onClick={() => setOpen(p => !p)}>
                    <CustomChip size='small' color={tag.color} defaultColor="secondary"
                        label={tag.name}
                        sx={{
                            maxHeight: open ? "2rem" : ".5rem", maxWidth: open ? "10rem" : "3rem",
                            transition: `all 150ms ease-in-out ${open ? "0ms" : "100ms"}`,
                            "& .MuiChip-label": {
                                opacity: open ? 1 : 0,
                                transition: `opacity 200ms ease-in-out ${open ? "150ms" : "0ms"}`,
                            }
                        }}
                    />
                </Button>
            )}
            <CustomChip color="primary" size='small' label="Modificar"
                sx={{
                    maxHeight: open ? "2rem" : "0", maxWidth: open ? "10rem" : "0", opacity: open ? 1 : 0,
                    transition: `all 150ms ease-in-out ${open ? "150ms" : "0ms"}`,
                }} />
        </Stack>
    )
}
