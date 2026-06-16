import { Stack } from '@mui/material'
import CustomChip from 'src/components/ui/details/CustomChip'
import type { LeadContactStateDetailed } from 'src/types/contactState'
import type { LeadStateDetailed } from 'src/types/leadFlow'

interface LeadDetailsState {
    leadId: number,
    contactState: LeadContactStateDetailed,
    flowState: LeadStateDetailed,
}

export const LeadDetailsState = ({ leadId, contactState, flowState }: LeadDetailsState) => {

    return (
        <Stack spacing={1} direction="row" useFlexGap sx={{ alignItems: "center", justifyContent: "start", flexWrap: "wrap" }}>
            <CustomChip label={contactState.name} chipColor={contactState.color} />
            <CustomChip label={flowState.name} chipColor={flowState.color} />
        </Stack>
    )
}
